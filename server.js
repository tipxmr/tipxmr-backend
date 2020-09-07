const io = require("socket.io")(3000);

let streamer = [];

function addStreamer(socketId, streamerInfo) {
  const existingStreamer = streamer.find(
    (streamer) => streamer.streamerName === streamerInfo.streamerName
  );
  // if Streamer existits, update streamer id, if socketId differs
  if (existingStreamer !== undefined) {
    if (existingStreamer.streamerSocketId !== socketId) {
      existingStreamer.streamerSocketId = socketId;
    }
  } else {
    // new streamer added
    streamer.push({
      streamerSocketId: socketId,
      streamerName: streamerInfo.streamerName,
      hashedSeed: streamerInfo.hashedSeed,
    });
  }
}

io.on("connect", (socket) => {
  // Streamer connects
  socket.on("streamerInfo", (streamerInfo) => {
    addStreamer(socket.id, streamerInfo);
    console.dir(streamer);
  });
  // donator requests
  socket.on("getSubaddress", (data) => {
    io.to(streamerSocketId);
  });
  socket.on("returnSubaddress", (subaddress) => {
    console.log("Subaddress", subaddress);
  });
});
