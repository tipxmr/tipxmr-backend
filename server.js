const services = require("./services.js");
const io = require("socket.io")(3000);

let streamers = {};

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

io.on("connect", (socket) => {
  // Streamer connects
  socket.on("streamerInfo", (streamerInfo) => {
    addStreamer(socket.id, streamerInfo);
  });
  // donator requests Subaddress
  socket.on("getSubaddress", (data) => {
    console.log(
      data.donor + " requested subaddress of streamer: " + data.streamerName
    );
    const requestedStreamer = streamers[streamerInfo.streamerName];
    if (requestedStreamer !== undefined && requestedStreamer.online === true) {
      // add socketID to data object, so the backend knows where to send the subaddress
      data.donatorSocketId = socket.id;
      // backend relays request to specific streamer
      io.to(requestedStreamer.streamerSocketId).emit("getSubaddress", data);
    } else {
      io.to(socket.id).emit(
        "returnSubaddress",
        "Streamer not found or not online"
      );
    }
  });

  // streamer returns subaddress
  socket.on("returnSubaddress", (data) => {
    console.log("Subaddress", data.subaddress);
    io.to(data.donatorSocketId).emit("returnSubaddress", data);
  });

  socket.on("disconnect", () => onDisconnectOrTimeout(streamers));
});
