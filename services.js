export function onDisconnectOrTimeout(reason) {
  if (reason === "io client disconnect") {
    const disconnectedStreamer = Object.values(streamers).find(
      (streamer) => streamer.streamerSocketId === socket.id
    );
    streamers[disconnectedStreamer.streamerName].online = false;
    console.log(
      "streamer: " +
        streamers[disconnectedStreamer.streamerName].streamerName +
        " disconnected"
    );
  }
}
