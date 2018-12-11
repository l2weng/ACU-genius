const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = Number(process.env.PORT) || 8188

app.get('/', async function (req, res) {
  res.status(200).send({ workers: [] })
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
