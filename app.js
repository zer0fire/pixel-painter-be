const express = require('express')
const socketIO = require('socket.io')
const path = require('path')
const Jimp = require('jimp')
const fs = require('fs')

const app = express()
const port = 3005
const server = app.listen(port, '0.0.0.0', () => {
  console.log('server listening on port', port)
})

const io = socketIO(server)

// app.use(express.static())


// var clients = []
async function main() {
  const pixelData = await Jimp.read("./23333.png") // new Jimp.create(20, 20, 0xffff00ff)
  let onlineCount = 0
  // console.log("------------", pixelData)
  io.on('connection', async (socket) => {
    onlineCount++

    io.emit('online-count', onlineCount)
    // socket.broadcast.emit('online-count', onlineCount)
    // socket.emit('online-count', onlineCount)

    var pngBuffer = await pixelData.getBufferAsync(Jimp.MIME_PNG)

    socket.emit('initial-pixel-data', pngBuffer)

    socket.on('draw-dot', async ({row, col, color}) => {
      
      var hexColor = Jimp.cssColorToHex(color)
      
      pixelData.setPixelColor(hexColor, col, row) // [col][row] = color
      
      io.emit('update-dot', {row, col, color})
      // socket.broadcast.emit('update-dot', {row, col, color})
      // socket.emit('update-dot', {row, col, color})

      var buf = await pixelData.getBufferAsync(Jimp.MIME_PNG)
      fs.writeFile('./23333.png', buf, (err) =>{
        if(err) {
          console.log(err)
        } else {
          console.log('save data success!')
        }
      })
    })

    socket.on('disconnect', () => {
      onlineCount--
      console.log('some one leave')
    })

  })
  
}

main()









