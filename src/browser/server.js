'use strict'

const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = Number(process.env.PORT) || 8188
const OSS = require('ali-oss')
const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

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
app.post('/syncProject2Cloud', (req, res) => {
  let { project } = req.body
  upload2Cloud(project)
  res.send('POST request to homepage')
})

function getOOSConfig() {
  return {
    region: 'oss-cn-shanghai',
    accessKeyId: 'LTAIHmYSWuHcT5xd',
    accessKeySecret: 'JS0Uub4G47eOwXw70EDmby0knaqDbh',
    bucket: 'labelreal'
  }
}

function upload2Cloud(project) {
  let client = new OSS(getOOSConfig())
  let checkpoint
  async function resumeUpload() {
    // retry 5 times
    for (let i = 0; i < 5; i++) {
      try {
        const result = client.multipartUpload(project.name,
          project.file, {
            checkpoint,
            async progress(percentage, cpt) {
              checkpoint = cpt
            },
          })
        console.log(result)
        break // break if success
      } catch (e) {
        console.log(e)
      }
    }
  }
  resumeUpload()
}

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
