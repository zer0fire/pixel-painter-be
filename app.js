const express = require('express')
const socketIO = require('socket.io')
const path = require('path')
const Jimp = require('jimp')
const fs = require('fs')

const app = express()
const port = 3005
const server = app.listen(port, () => {
  console.log('server listening on port', port)
})

const io = socketIO(server)

// app.use(express.static())


// var clients = []
async function main() {
  const pixelData = await Jimp.read("./pixelData.png") // new Jimp.create(20, 20, 0xffff00ff)
  // console.log("------------", pixelData)
  io.on('connection', async (socket) => {
    // 这里改成了JPG格式
    // var jpgBuffer = await pixelData.getBufferAsync(Jimp.MIME_JPEG)
    var pngBuffer = await pixelData.getBufferAsync(Jimp.MIME_PNG)
    // ClientRectList.push(socket)
    // socket.emit('initial-pixel-data', jpgBuffer)
    socket.emit('initial-pixel-data', pngBuffer)
    // dotInfo
    socket.on('draw-dot', async ({row, col, color}) => {
      
      var hexColor = Jimp.cssColorToHex(color)
      // console.log(hexColor, col, row);
      
      pixelData.setPixelColor(hexColor, col, row) // [col][row] = color
      // console.log({row, col, color})
      
      socket.broadcast.emit('update-dot', {row, col, color})
      socket.emit('update-dot', {row, col, color})

      var buf = await pixelData.getBufferAsync(Jimp.MIME_PNG)
      // var buf = await pixelData.getBufferAsync(Jimp.MIME_JPEG)
      fs.writeFile('./pixelData.png', buf, (err) =>{
        if(err) {
          console.log(err)
        } else {
          console.log('save data success!')
        }
      })
    })

    socket.on('disconnect', () => {
      // clients = clients.filter(it => it != socket)
      console.log('some one leave')
    })

  })
  
}

main()









