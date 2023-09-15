const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { cors: true });
const path = require("path");
const Jimp = require("jimp");
const fs = require("fs");

app.use(express.static(path.join(__dirname, "../pixel-painter/build")));

async function main() {
  const pixelData = await Jimp.read("./23333.png"); // new Jimp.create(20, 20, 0xffff00ff)
  let onlineCount = 0;
  let bufDataAry = [];
  // console.log("------------", pixelData)
  io.on("connection", async (socket) => {
    onlineCount++;

    io.emit("online-count", onlineCount);
    // socket.broadcast.emit('online-count', onlineCount)
    // socket.emit('online-count', onlineCount)

    var pngBuffer = await pixelData.getBufferAsync(Jimp.MIME_PNG);

    socket.emit("initial-pixel-data", pngBuffer);

    socket.on("draw-dot", async ({ row, col, color }) => {
      var hexColor = Jimp.cssColorToHex(color);

      pixelData.setPixelColor(hexColor, col, row); // [col][row] = color

      io.emit("update-dot", {
        row,
        col,
        color,
      });
      // socket.broadcast.emit('update-dot', {row, col, color})
      // socket.emit('update-dot', {row, col, color})

      var buf = await pixelData.getBufferAsync(Jimp.MIME_PNG);
      bufDataAry.push(buf);
      if (bufDataAry.length > 4) {
        for (var item of bufDataAry) {
          fs.writeFile("./23333.png", item, (err) => {
            if (err) {
              console.log(err);
            } else {
              console.log("save data success!");
            }
          });
        }
      }
    });

    socket.on("disconnect", () => {
      onlineCount--;
      console.log("some one leave");
    });
  });
}

main();

server.listen(3001, () => {
  console.log("listening on *:3001");
});
