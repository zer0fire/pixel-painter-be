const express = require('express')
const socketIO = require('socket.io')
const path = require('path')

const app = express()
const port = 3005
const server = app.listen(port, () => {
  console.log('server listening on port', port)
})

const io = SocketIO(server)

// app.use(express.static())

const pixelData = [
  ['red', 'red', 'blue', 'white'],
  ['red', 'red', 'blue', 'white'],
  ['red', 'red', 'blue', 'white'],
  ['red', 'red', 'blue', 'white'],
]

io.on('connection', (ws) => {
  ws.emit('pixel-data', pixelData)

  ws.on('disconnect', () => {
    console.log('some one leave')
  })

})








