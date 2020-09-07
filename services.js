export function onDisconnectOrTimeout(streamers) {
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
