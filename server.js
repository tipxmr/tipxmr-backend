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
  socket.on("returnSubaddress", (data) => {
    onStreamerReturnsSubaddress(data);
  });

  // streamer wallet recieved donation
  socket.on("paymentRecieved", (data) => {});

  // streamer disconnects
  socket.on("disconnect", () => onStreamerDisconnectOrTimeout(socket));
});

// ===============================================================
// Donator Namespace
// ===============================================================

donatorNamespace.on("connection", (socket) => {
  // donator requests Subaddress
  socket.on("getSubaddress", (data) => {
    onGetSubaddress(data);
  });

  // donator disconnects
  socket.on("disconnect", () => {
    onDonatorDisconnectOrTimeout(socket);
  });
});

// ===============================================================
// All Functions
// ===============================================================

// callbacks streamer
function onStreamerInfo(socket, streamerInfo) {
  db.addStreamer(socket.id, streamerInfo);
}

function onStreamerReturnsSubaddress(data) {
  console.log("Subaddress", data.subaddress);
  io.to(data.donatorSocketId).emit("returnSubaddress", data);
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

// donator callbacks
function onGetSubaddress(data) {
  console.log(
    data.donor + " requested subaddress of streamer: " + data.streamerName
  );
  const requestedStreamer = db.getStreamerByUsername(data.username);
  if (requestedStreamer !== undefined && requestedStreamer.online === true) {
    // add socketID to data object, so the backend knows where to send the subaddress
    data.donatorSocketId = socket.id;
  }
}

function onDonatorDisconnectOrTimeout(socket) {
  console.log("donator (" + socket.id + ") disconnected");
}
