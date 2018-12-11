const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = Number(process.env.PORT) || 8188
const mdns = require('mdns')
let workers = {}
const browser = mdns.createBrowser(mdns.tcp('http'))

browser.on('serviceUp', service => {
  if (workers[service.host]) return
  let expression = /((\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}\b))/
  const regex = new RegExp(expression, 'g')
  let addresses = service.addresses
  const matchedAddress = addresses.filter(address=>regex.test(address))
  if (Number(service.port) !== port) return
  workers[service.host] = { address: matchedAddress[0], port: service.port }
})

browser.on('serviceDown', function (service) {
// ignore duplicate downs
  if (!workers[service.host]) return
  delete workers[service.host]
})

browser.start()

app.get('/', async function (req, res) {
  res.status(200).send({ workers: workers })
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
  let ad = mdns.createAdvertisement(mdns.tcp('http'), port)
  ad.start()
  console.log('listening on *:' + port)
})
