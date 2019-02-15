'use strict'

const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = Number(process.env.PORT) || 8188

app.get('/file', async function (req, res, next) {
  let { directory, fileName } = req.query
  let options = {
    dotfiles: 'deny',
    root: directory + '/',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true,
    }
  }
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err)
    } else {
      console.log('Sent:', `${directory}/${fileName}`)
    }
  })
})

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' })
  socket.on('chat message', function (msg) {
    io.emit('chat message', msg)
  })
  socket.on('disconnect', function () {
    io.emit('server offline')
  })
})

http.listen(port, function () {
  console.log('listening on *:' + port)
})
