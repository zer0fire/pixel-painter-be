// const socketIO = require("socket.io");
const path = require("node:path");
const fs = require("node:fs");
const http = require("node:http");
const express = require("express");
const Jimp = require("jimp");

const app = express();

const server = http.createServer(app);
// server;
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
server.listen(3001, () => {
  // eslint-disable-next-line no-console
  console.log("socket on 3001");
});

// http://0.0.0.0:3005
// const url = "0.0.0.0";
// const port = 3005;

app.use(express.static(path.join(__dirname, "../fe/build")));

// var clients = []
async function main() {
  const pixelData = await Jimp.read("./23333.png"); // new Jimp.create(20, 20, 0xffff00ff)
  let onlineCount = 0;
  const bufDataAry = [];
  // console.log("------------", pixelData)
  io.on("connection", async (socket) => {
    onlineCount++;

    io.emit("online-count", onlineCount);
    // socket.broadcast.emit('online-count', onlineCount)
    // socket.emit('online-count', onlineCount)

    const pngBuffer = await pixelData.getBufferAsync(Jimp.MIME_PNG);

    socket.emit("initial-pixel-data", pngBuffer);

    socket.on("draw-dot", async ({ row, col, color }) => {
      const hexColor = Jimp.cssColorToHex(color);
      pixelData.setPixelColor(hexColor, col, row); // [col][row] = color

      io.emit("update-dot", { row, col, color });
      // socket.broadcast.emit('update-dot', {row, col, color})
      // socket.emit('update-dot', {row, col, color})

      const buf = await pixelData.getBufferAsync(Jimp.MIME_PNG);
      bufDataAry.push(buf);
      if (bufDataAry.length > 4) {
        for (const item of bufDataAry) {
          fs.writeFile("./23333.png", item, (err) => {
            if (err) {
              // eslint-disable-next-line no-console
              console.log(err);
            } else {
              // eslint-disable-next-line no-console
              console.log("save data success!");
            }
          });
        }
      }
    });

    socket.on("disconnect", () => {
      onlineCount--;
      // eslint-disable-next-line no-console
      console.log("some one leave");
    });
  });
}

main();
