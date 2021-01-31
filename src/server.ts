import * as path from "path";
import express from "express";
import { Server, Socket } from "socket.io";
import { createServer } from "http";
import * as db from "./db";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
  },
});

const streamerNamespace = io.of("/streamer");
const donatorNamespace = io.of("/donator");
const animationNamespace = io.of("/animation");

/* interface success_interface {
  type: string;
  message: string;
  data: object;
}

interface error_interface {
  type: string;
  message: string;
  error: any;
} */

type Success<T> = {
  type: string;
  message: string;
  data: T;
};

type Failure<E> = {
  type: string;
  message: string;
  error: E;
};

type ReturnMask<T, E> = Success<T> | Failure<E>;

db.populateTestStreamers();

app.set("view engine", "pug");

app.use("/public", express.static(path.join(__dirname, "public")));

app.get("/", (request, response) => {
  response.send("Hello there");
});

app.get("/animation/:uid", (request, response) => {
  const { uid } = request.params;

  if (uid) {
    db.hasStreamingSession(uid)
      .then((isValid: boolean) => {
        if (isValid) {
          response.render("animation");
        } else {
          response.send("invalid");
        }
      })
      .catch(() => {
        response.send("error");
      });
  } else {
    response.redirect("/");
  }
});

// ===============================================================
// Streamer Namespace
// ===============================================================

streamerNamespace.on("connection", (socket: Socket) => {
  // streamer requests config at login by giving his hashedSeed
  socket.on("login", ({ hashedSeed, userName }, callback) => {
    onLogin(socket, hashedSeed, userName).then((response) => {
      //socket.emit("login", response);
      callback(response);
    });
  });

  // streamer return subaddress
  socket.on("subaddressToBackend", (data) => {
    onSubaddressToBackend(data);
  });

  // streamer wallet recieved donation
  socket.on("paymentRecieved", (newDonation) => {
    onPaymentRecieved(newDonation);
  });

  // streamer disconnects
  socket.on("disconnect", () => {
    onStreamerDisconnectOrTimeout(socket);
  });

  // streamer changes his config, update db
  socket.on("updateConfig", (newStreamerConfig) => {
    db.updateStreamer(newStreamerConfig);
  });

  socket.on("updateOnlineStatus", ({ hashedSeed, newOnlineStatus }) => {
    db.updateOnlineStatusOfStreamer(hashedSeed, newOnlineStatus);
  });

  // TODO: use proper streamer, donator and ?animator socket namespaces
  // TODO: define event/message types
  socket.on("XXX_send_donation", (data) => {
    streamerNamespace.emit("XXX_animation_start_paint", data);
  });

  socket.on("XXX_update_settings", (settings) => {
    streamerNamespace.emit("XXX_animation_update_settings", settings);
  });

  socket.on("XXX_animation_get_settings", () => {
    streamerNamespace.emit("XXX_animation_update_settings", {
      opacity: 1,
    });
    // streamerNamespace.emit("XXX_animation_update_settings", {
    //   vector: [0, 10, 30],
    //   display: 'block',
    //   padding: 20,
    //   background: 'linear-gradient(to right, #009fff, #ec2f4b)',
    //   transform: 'translate3d(0px,0,0) scale(1) rotateX(0deg)',
    //   boxShadow: '0px 10px 20px 0px rgba(0,0,0,0.4)',
    //   borderBottom: '10px solid #2D3747',
    //   shape: 'M20,20 L20,380 L380,380 L380,20 L20,20 Z',
    //   textShadow: '0px 5px 15px rgba(255,255,255,0.5)'
    // });
  });

  socket.on("XXX_animation_start_paint", (data) => {
    console.log("animation start paint", data);
  });

  socket.on("XXX_animation_update_settings", (settings) => {
    console.log("animation update settings", settings);
  });
});

// ===============================================================
// Donator Namespace
// ===============================================================

donatorNamespace.on("connection", (socket: Socket) => {
  // donator requestes info about streamer
  socket.on("getStreamer", (streamer) => {
    onGetStreamer(socket.id, streamer);
  });

  // donator requests Subaddress
  socket.on("getSubaddress", (data) => {
    onGetSubaddress(socket, data);
  });

  // donator disconnects
  socket.on("disconnect", () => {
    onDonatorDisconnectOrTimeout(socket);
  });

  socket.on("getOnlineStreamers", () => {
    onGetOnlineStreamers(socket);
  });
});

// ===============================================================
// Animation Namespace
// ===============================================================

animationNamespace.on("connection", (socket: Socket) => {
  socket.on("getAnimationConfig", (streamerName) => {
    onGetAnimationConfig(socket.id, streamerName);
  });
});

async function onGetAnimationConfig(donatorSocketId: string, userName: string) {
  const requestedStreamer: any = await db.getStreamer("userName", userName);
  // strip down relevant information for donator
  // only if array is not empty
  let animationSettings = requestedStreamer.docs[0]?.animationSettings ?? {};
  animationNamespace
    .to(donatorSocketId)
    .emit("getAnimationConfig", animationSettings);
}

// ===============================================================
// All Functions
// ===============================================================

async function onLogin(socket: Socket, hashedSeed: string, userName: string) {
  return await db.loginStreamer(socket.id, hashedSeed, userName);
}

function onSubaddressToBackend(data: {
  displayName: string;
  subaddress: string;
  donatorSocketId: string;
}) {
  console.log(
    "New subaddress from " + data.displayName + ": " + data.subaddress
  );
  donatorNamespace.to(data.donatorSocketId).emit("subaddressToDonator", data);
}

async function onStreamerDisconnectOrTimeout(socket: Socket) {
  const disconnectedStreamer: ReturnMask = await db.getStreamer(
    "socketId",
    socket.id
  );
  if (
    disconnectedStreamer.data !== null &&
    disconnectedStreamer.data !== undefined
  ) {
    db.updateOnlineStatusOfStreamer(
      disconnectedStreamer.data.hashedSeed,
      false
    );
    console.log(
      "streamer: " + disconnectedStreamer.data.displayName + " disconnected"
    );
  }
}

function onPaymentRecieved(newDonation: object) {
  console.log(
    "Recieved new donation from " +
      newDonation.donor +
      " to " +
      newDonation.displayName
  );
  donatorNamespace
    .to(newDonation.donatorSocketId)
    .emit("paymentConfirmation", newDonation);
}

// donator callbacks
async function onGetStreamer(donatorSocketId: string, userName: string) {
  console.log(
    "Donator (" +
      donatorSocketId +
      ") requested streamer info from " +
      userName +
      "."
  );
  const requestedStreamer = await db.getStreamer("userName", userName);
  console.log("requestedStreamer", requestedStreamer);
  // strip down relevant information for donator
  // only if array is not empty
  if (requestedStreamer.docs.length) {
    const returnStreamerToDonator = {
      userName: requestedStreamer.userName,
      displayName: requestedStreamer.displayName,
      hashedSeed: requestedStreamer.hashedSeed,
      isOnline: requestedStreamer.isOnline,
      secondPrice: requestedStreamer.animationSettings.secondPrice,
      charPrice: requestedStreamer.animationSettings.charPrice,
      charLimit: requestedStreamer.animationSettings.charLimit,
      minAmount: requestedStreamer.animationSettings.minAmount,
      gifsMinAmount: requestedStreamer.animationSettings.gifsMinAmount,
      goalProgress: requestedStreamer.animationSettings.goalProgress,
      goal: requestedStreamer.animationSettings.goal,
      goalReached: requestedStreamer.animationSettings.goalReached,
      streamUrl: requestedStreamer.stream.url,
      streamPlatform: requestedStreamer.stream.platform,
      streamLanguage: requestedStreamer.stream.language,
      streamDescription: requestedStreamer.stream.description,
      streamCategory: requestedStreamer.stream.category,
    };
    donatorNamespace
      .to(donatorSocketId)
      .emit("recieveStreamer", returnStreamerToDonator);
  } else {
    donatorNamespace.to(donatorSocketId).emit("recieveStreamer", 0);
  }
}

async function onGetSubaddress(socket: Socket, data: any) {
  console.log(
    data.donor + " requested subaddress of streamer: " + data.displayName
  );
  const requestedStreamer = await db.getStreamer("userName", data.userName);
  if (
    requestedStreamer.docs[0] !== undefined &&
    requestedStreamer.docs[0].isOnline === true
  ) {
    // add socketID to data object, so the streamer and the backend know where to send the subaddress
    data.donatorSocketId = socket.id;
    streamerNamespace
      .to(requestedStreamer.docs[0].streamerSocketId)
      .emit("createSubaddress", data);
  }
}

function onDonatorDisconnectOrTimeout(socket: Socket) {
  console.log("donator (" + socket.id + ") disconnected");
}

async function onGetOnlineStreamers(socket: Socket) {
  const onlineStreamers = await db.getAllOnlineStreamers();
  donatorNamespace.to(socket.id).emit("emitOnlineStreamers", onlineStreamers);
}

httpServer.listen(3000);
