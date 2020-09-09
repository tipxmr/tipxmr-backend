const io = require("socket.io")(3000, { origins: "*:*" });
const streamerNamespace = io.of("/streamer");
const donatorNamespace = io.of("/donator");

// ===============================================================
// Streamer Namespace
// ===============================================================

streamerNamespace.on("connection", (socket) => {

  // streamer sends info
  socket.on("streamerInfo", (streamerInfo) => {});

  // streamer return subaddress
  socket.on("returnSubaddress", (data) => {});

  // streamer wallet recieved donation
  socket.on("paymentRecieved", (data) => {});

  // streamer disconnects
  socket.on("disconnect", () => );
});

// ===============================================================
// Donator Namespace
// ===============================================================

donatorNamespace.on("connection", (socket) => {
  // donator requests Subaddress
  socket.on("getSubaddress", (data) => {}

  // donator disconnects
  socket.on("disconnect", () => );
});