const app = require("express")();
const path = require("path");
const server = require('http').createServer(app);
const io = require("socket.io")(server);

const PORT = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, "./build")));

app.get("/", (req, res, next) => {
  res.sendFile(path.join(__dirname + "./index.html"));
});

io.on("connection", (socket) => {
  socket.emit("me", socket.id);

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
  });

  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("callUser", { signal: signalData, from, name });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });
});

server.listen(PORT, () => console.log(`Server is listeting on PORT ${PORT}`));
