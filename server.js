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
    }
  } else {
    // new streamer added
    streamers.push({
      streamerSocketId: socketId,
      streamerName: streamerInfo.streamerName,
      hashedSeed: streamerInfo.hashedSeed,
      online: true,
    });
  }
}

io.on("connect", (socket) => {
  // Streamer connects
  socket.on("streamerInfo", (streamerInfo) => {
    addStreamer(socket.id, streamerInfo);
    console.dir(streamer);
  });
  // donator requests Subaddress
  socket.on("getSubaddress", (data) => {
    const requestedStreamer = streamers.find(
      (streamer) => streamer.streamerName === data.streamerName
    );
    // backend relays request to specific streamer
    io.to(requestedStreamer.streamerSocketId).emit("getSubaddress", data);
  });
  socket.on("returnSubaddress", (subaddress) => {
    console.log("Subaddress", subaddress);
  });

  socket.on("disconnect", (reason) => {
    if (reason === "io client disconnect") {
      const disconnectedStreamer = streamers.find(
        (streamer) => streamer.streamerSocketId === socket.id
      );
      disconnectedStreamer.online = false;
    }
  });
});
