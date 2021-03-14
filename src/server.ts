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

db.populateTestStreamers();

// ===============================================================
// Streamer Namespace
// ===============================================================

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

async function onGetAnimationConfig(donatorSocketId: string, userName: string) {
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
}

// ===============================================================
// All Functions
// ===============================================================

async function onLogin(socket: Socket, _id: string, userName: string) {
  return await db.loginStreamer(socket.id, _id, userName);
}

function onSubaddressToBackend(data: {
  displayName: string;
  donatorSocketId: string;
  subaddress: string;
}) {
  console.log(
    "New subaddress from " + data.displayName + ": " + data.subaddress
  );
  donatorNamespace.to(data.donatorSocketId).emit("subaddressToDonator", data);
}

async function onStreamerDisconnectOrTimeout(socket: Socket) {
  const result = await db.getStreamer({ streamerSocketId: socket.id });
  if (result.isSuccess()) {
    const streamer = result.unwrap();
    db.updateOnlineStatusOfStreamer(streamer._id, false);
    console.log(`${streamer.displayName} disconnected"`);
  }
}

function onPaymentRecieved(newDonation: any) {
  console.log(
    `Recieved new donation from ${newDonation.donor} to ${newDonation.displayName}`
  );
  donatorNamespace
    .to(newDonation.donatorSocketId)
    .emit("paymentConfirmation", newDonation);
}

// donator callbacks
async function onGetStreamer(donatorSocketId: string, userName: string) {
  console.log(
    `Donator (${donatorSocketId}) requested streamer info from ${userName}`
  );
  const result = await db.getStreamer({ userName });

  // strip down relevant information for donator
  // only if array is not empty
  if (result.isSuccess()) {
    const requestedStreamer = result.unwrap();
    const returnStreamerToDonator = {
      userName: requestedStreamer.userName,
      displayName: requestedStreamer.displayName,
      _id: requestedStreamer._id,
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
}

function onDonatorDisconnectOrTimeout(socket: Socket) {
  console.log("donator (" + socket.id + ") disconnected");
}

async function onGetOnlineStreamers(socket: Socket) {
  const onlineStreamers = await db.getAllOnlineStreamers();
  donatorNamespace.to(socket.id).emit("emitOnlineStreamers", onlineStreamers);
}

httpServer.listen(3000);
