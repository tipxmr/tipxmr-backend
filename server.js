const io = require("socket.io")(3000);

let streamers = [];

function addStreamer(socketId, streamerInfo) {
  const existingStreamer = streamers.find(
    (streamer) => streamer.streamerName === streamerInfo.streamerName
  );
  // if Streamer existits, update streamer id, if socketId differs
  if (existingStreamer !== undefined) {
    if (existingStreamer.streamerSocketId !== socketId) {
      existingStreamer.streamerSocketId = socketId;
      existingStreamer.online = true;
      console.log(
        "Updated SocketID of existing streamer: " +
          existingStreamer.streamerName
      );
    }
  } else {
    // new streamer added
    streamers.push({
      streamerSocketId: socketId,
      streamerName: streamerInfo.streamerName,
      hashedSeed: streamerInfo.hashedSeed,
      online: true,
    });
    console.log("Added new streamer: " + streamerInfo.streamerName);
  }
}

io.on("connect", (socket) => {
  // Streamer connects
  socket.on("streamerInfo", (streamerInfo) => {
    addStreamer(socket.id, streamerInfo);
    console.dir("all streamers:", streamers);
  });
  // donator requests Subaddress
  socket.on("getSubaddress", (data) => {
    console.log(
      data.donor + " requested subaddress of streamer: " + data.streamerName
    );
    const requestedStreamer = streamers.find(
      (streamer) => streamer.streamerName === data.streamerName
    );
    if (requestedStreamer !== undefined && requestedStreamer.online === true) {
      // add socketID to data object, so the backend knows where to send the subaddress
      data.donatorSocketId = socket.id;
      // backend relays request to specific streamer
      io.to(requestedStreamer.streamerSocketId).emit("getSubaddress", data);
    } else {
      io.to(socket.id).emit("returnSubaddress", "Streamer not found or online");
    }
  });

  // streamer returns subaddress
  socket.on("returnSubaddress", (data) => {
    console.log("Subaddress", data.subaddress);
    io.to(data.donatorSocketId).emit("returnSubaddress", data);
  });

  socket.on("disconnect", (reason) => {
    if (reason === "io client disconnect") {
      const disconnectedStreamer = streamers.find(
        (streamer) => streamer.streamerSocketId === socket.id
      );
      disconnectedStreamer.online = false;
      console.log(
        "streamer: " + disconnectedStreamer.streamerName + " disconnected"
      );
    }
  });
});
