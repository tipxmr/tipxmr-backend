const io = require("socket.io")(3000);

io.on("connect", (socket) => {
  socket.on("returnSubaddress", (subaddress) => {
    console.log("Subaddress", subaddress);
  });
});
