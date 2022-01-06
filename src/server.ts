import express from "express";
import cors from "cors";
import { Server, Socket } from "socket.io";
import { createServer } from "http";
import * as db from "./db_sql";

const app = express();
app.use(cors());
app.use(express.json());
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
});

const streamerNamespace = io.of("/streamer");
const donatorNamespace = io.of("/donator");
const animationNamespace = io.of("/animation");

const trunkateHashedSeed = (hashedSeed: string) => hashedSeed.slice(0, 11);

// ===============================================================
// Streamer Namespace
// ===============================================================

app.post('/login', async (req, res, next) => {
  const { hashedSeed } = req.body;
  let streamer;
  try {
    streamer = await db.getStreamerById(trunkateHashedSeed(hashedSeed));
  } catch (error) {
    return next(error);
  }
  if (!streamer) {
    return next(new Error("Streamer not found"));
  }
  res.json({streamer});
});



/* 
streamerNamespace.on("connection", (socket: Socket) => {
  // streamer requests config at login by giving his _id
  socket.on("login", ({ _id, userName }, callback) => {
    onLogin(socket, _id, userName).then((response) => {
      //socket.emit("login", response);
      callback(response.unwrap());
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

  socket.on("updateOnlineStatus", ({ _id, newOnlineStatus }) => {
    db.updateOnlineStatusOfStreamer(_id, newOnlineStatus);
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

const onGetAnimationConfig = async (
  donatorSocketId: string,
  userName: string
) => {
  const requestedStreamer = await db.getStreamer({
    userName,
  });
  // strip down relevant information for donator
  // only if array is not empty
  if (requestedStreamer.isSuccess()) {
    const { animationSettings } = requestedStreamer.unwrap();
    animationNamespace
      .to(donatorSocketId)
      .emit("getAnimationConfig", animationSettings);
  }
};

// ===============================================================
// All consts
// ===============================================================

const onLogin = async (socket: Socket, _id: string, userName: string) => {
  return await db.loginStreamer(socket.id, _id, userName);
};

const onSubaddressToBackend = (data: {
  displayName: string;
  donatorSocketId: string;
  subaddress: string;
}) => {
  console.log(`New subaddress from ${data.displayName}: ${data.subaddress}`);
  donatorNamespace.to(data.donatorSocketId).emit("subaddressToDonator", data);
};

const onStreamerDisconnectOrTimeout = async (socket: Socket) => {
  const result = await db.getStreamer({ streamerSocketId: socket.id });
  if (result.isSuccess()) {
    const streamer = result.unwrap();
    db.updateOnlineStatusOfStreamer(streamer._id, false);
    console.log(`${streamer.displayName} disconnected"`);
  }
};

const onPaymentRecieved = (newDonation: any) => {
  console.log(
    `Recieved new donation from ${newDonation.donor} to ${newDonation.displayName}`
  );
  donatorNamespace
    .to(newDonation.donatorSocketId)
    .emit("paymentConfirmation", newDonation);
};

// donator callbacks
const onGetStreamer = async (donatorSocketId: string, userName: string) => {
  console.log(
    `Donator (${donatorSocketId}) requested streamer info from ${userName}`
  );
  const result = await db.getStreamer({ userName });

  // strip down relevant information for donator
  // only if array is not empty
  if (result.isSuccess()) {
    const requestedStreamer = result.unwrap();
    const returnStreamerToDonator = {
      _id: requestedStreamer._id,
      charLimit: requestedStreamer.animationSettings.charLimit,
      charPrice: requestedStreamer.animationSettings.charPrice,
      displayName: requestedStreamer.displayName,
      gifsMinAmount: requestedStreamer.animationSettings.gifsMinAmount,
      goal: requestedStreamer.animationSettings.goal,
      goalProgress: requestedStreamer.animationSettings.goalProgress,
      goalReached: requestedStreamer.animationSettings.goalReached,
      isOnline: requestedStreamer.isOnline,
      minAmount: requestedStreamer.animationSettings.minAmount,
      secondPrice: requestedStreamer.animationSettings.secondPrice,
      streamCategory: requestedStreamer.stream.category,
      streamDescription: requestedStreamer.stream.description,
      streamLanguage: requestedStreamer.stream.language,
      streamPlatform: requestedStreamer.stream.platform,
      streamUrl: requestedStreamer.stream.url,
      userName: requestedStreamer.userName,
    };
    donatorNamespace
      .to(donatorSocketId)
      .emit("recieveStreamer", returnStreamerToDonator);
  } else {
    donatorNamespace.to(donatorSocketId).emit("recieveStreamer", 0);
  }
};

const onGetSubaddress = async (socket: Socket, data: any) => {
  console.log(
    `${data.donor} requested subaddress of streamer: ${data.displayName}`
  );
  const result = await db.getStreamer({ userName: data.userName });
  if (result.isSuccess()) {
    const streamer = result.unwrap();
    if (streamer.isOnline) {
      data.donatorSocketId = socket.id;
      streamerNamespace
        .to(streamer.streamerSocketId)
        .emit("createSubaddress", data);
    }
  }
};

const onDonatorDisconnectOrTimeout = (socket: Socket) => {
  console.log("donator (" + socket.id + ") disconnected");
};

const onGetOnlineStreamers = async (socket: Socket) => {
  const onlineStreamers = await db.getAllOnlineStreamers();
  donatorNamespace.to(socket.id).emit("emitOnlineStreamers", onlineStreamers);
}; */

httpServer.listen(3000);
