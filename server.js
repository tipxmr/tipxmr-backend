const io = require("socket.io")(3000, { origins: "*:*" });
const streamerNamespace = io.of("/streamer");
const donatorNamespace = io.of("/donator");
const db = require("./db");

// ===============================================================
// Streamer Namespace
// ===============================================================

streamerNamespace.on("connection", (socket) => {
  // streamer sends info
  socket.on("streamerInfo", (streamerInfo) =>
    onStreamerInfo(socket, streamerInfo)
  );

  // streamer return subaddress
  socket.on("returnSubaddress", (data) => {});

  // streamer wallet recieved donation
  socket.on("paymentRecieved", (data) => {});

  // streamer disconnects
  socket.on("disconnect", () => onStreamerDisconnectOrTimeout(socket));
});

// callbacks streamer
function onStreamerInfo(socket, streamerInfo) {
  db.addStreamer(socket.id, streamerInfo);
  //addStreamer(socket.id, streamerInfo);
}

function onStreamerDisconnectOrTimeout(socket) {
  onStreamerDisconnectOrTimeout(socket);
}

// ===============================================================
// Donator Namespace
// ===============================================================

donatorNamespace.on("connection", (socket) => {
  // donator requests Subaddress
  socket.on("getSubaddress", (data) => {});

  // donator disconnects
  socket.on("disconnect", () => {});
});

// ===============================================================
// All Functions
// ===============================================================

function addStreamer(socketId, streamerInfo) {
  const existingStreamer = streamers[streamerInfo.streamerName];
  // if Streamer existits, update streamer id, if socketId differs
  if (existingStreamer !== undefined) {
    if (existingStreamer.streamerSocketId !== socketId) {
      streamers[streamerInfo.streamerName].streamerSocketId = socketId;
      streamers[streamerInfo.streamerName].online = true;
      console.log(
        "Updated SocketID of existing streamer: " +
          existingStreamer.streamerName
      );
    }
  } else {
    // new streamer added
    streamers[streamerInfo.streamerName] = {
      streamerSocketId: socketId,
      streamerName: streamerInfo.streamerName,
      hashedSeed: streamerInfo.hashedSeed,
      online: true,
    };
    console.log("Added new streamer: " + streamerInfo.streamerName);
  }
}

function onStreamerDisconnectOrTimeout(socket) {
  const disconnectedStreamer = Object.values(streamers).find((streamer) => {
    return streamer.streamerSocketId === socket.id;
  });
  if (disconnectedStreamer !== undefined) {
    streamers[disconnectedStreamer.streamerName].online = false;
    console.log(
      "streamer: " +
        streamers[disconnectedStreamer.streamerName].streamerName +
        " disconnected"
    );
  } else {
    console.log("Undefined streamer disconnected");
  }
}

function onDonatorDisconnectOrTimeout(socket) {
  console.log("disconnected Donator (" + socket.id + ")");
}
