'use strict'

require('./common/promisify')

const { basename, extname, dirname, join } = require('path')
const { createReadStream, statAsync: stat } = require('fs')
const { createHash } = require('crypto')
const { exif } = require('./exif')
const { nativeImage, remote } = require('electron')
const { assign } = Object
const { warn, debug, info } = require('./common/log')
const MIME = require('./constants/mime')
const { getNewOOSClient } = require('./common/dataUtil')
const fs = require('fs')
const request = require('request')


class Image {
  static read(path) {
    return (new Image(path, {})).read(path)
  }

  static download(path, syncFileUrl, newFileName, newPath) {
    // if(local)
    let fields = { host: '127.0.0.1', port: '8188', directory: dirname(path), fileName: newFileName, newPath }
    // return (new Image(fields).download(fields))
    //if(cloud)
    return (new Image(fields).downloadFromCloud(fields, syncFileUrl))
  }

  static async check({
    path,
    syncFileUrl,
    consolidated,
    created,
    checksum
  }, { force } = {}) {
    const status = {}

    try {
      const { mtime } = await stat(path)
      status.hasChanged = (mtime > (consolidated || created))

      if (force || created == null || status.hasChanged) {
        status.image = await Image.read(path)
        status.hasChanged = (status.image.checksum !== checksum)
      }
    } catch (error) {
      const app = remote.app
      let newPath = app.getPath('userData')
      newPath = join(newPath, 'project')
      if (!fs.existsSync(newPath)) {
        fs.mkdir(newPath, { recursive: true }, (err) => {
          if (err) throw err
        })
      }
      let newFileName = basename(path)
      await Image.download(path, syncFileUrl, newFileName, newPath)
      info(`${newPath}/${newFileName}`)
      try {
        status.image = await Image.read(`${newPath}/${newFileName}`)
        status.hasChanged = (status.image.checksum !== checksum)
      } catch (error) {
        debug(`image check failed for ${path}: ${error.message}`, {
          stack: error.stack
        })
        status.hasChanged = true
        status.image = null
        status.error = error
      }
      info('after....')
    }

    return status
  }

  constructor(path, fields) {
    this.path = path
    this.fields = fields
  }

  get ext() {
    return extname(this.path)
  }

  get dir() {
    return dirname(this.path)
  }
  get filename() {
    return basename(this.path)
  }

  get title() {
    return basename(this.path, this.ext)
  }

  get checksum() {
    if (this.__digest == null) this.__digest = this.digest()
    return this.__digest
  }

  get orientation() {
    return this.exif.Orientation || 1
  }

  get date() {
    try {
      // temporarily return as string until we add value types
      return (this.exif.DateTimeOriginal || this.file.ctime).toISOString()

    } catch (error) {
      warn(`failed to convert image date: ${error.message}`)
      debug(error.stack)

      return new Date().toISOString()
    }
  }

  get size() {
    return this.file && this.file.size
  }

  toJSON() {
    return {
      path: this.path,
      checksum: this.checksum,
      mimetype: this.mimetype,
      width: this.width,
      height: this.height,
      orientation: this.orientation,
      size: this.size
    }
  }

  digest(encoding = 'hex') {
    return this.hash && this.hash.digest(encoding)
  }

  read(path) {
    return new Promise((resolve, reject) => {

      this.hash = createHash('md5')
      this.mimetype = null

      const chunks = []

      createReadStream(path)
        .on('error', reject)

        .on('data', chunk => {
          this.hash.update(chunk)
          chunks.push(chunk)

          if (chunks.length === 1) {
            this.mimetype = magic(chunk)
          }
        })

        .on('end', () => {
          if (!this.mimetype) {
            return reject(new Error('unsupported image'))
          }

          const buffer = Buffer.concat(chunks)

          Promise
            .all([
              exif(buffer, this.mimetype),
              toImage(buffer, this.mimetype),
              stat(path)
            ])

            .then(([data, original, file]) =>
              assign(this, original.getSize(), { exif: data, original, file }))

            .then(resolve, reject)

        })
    })
  }

  download(fields) {
    let { host, port, directory, fileName, newPath } = fields
    return new Promise(async (resolve)=>{
      let fw = fs.createWriteStream(`${newPath}/${fileName}`)
      await request(`http://${host}:${port}/file?directory=${directory}&fileName=${fileName}`)
      .pipe(fw)
      .on('finish', (img) => {
        resolve(img)
      })
    })
  }

  downloadFromCloud(fields, syncFileUrl) {
    let { host, port, directory, fileName, newPath } = fields
    let objName = (/[^/]*$/).exec(syncFileUrl)[0]
    let client = getNewOOSClient()
    return new Promise(async (resolve)=>{
      let result = await client.getStream(objName)
      let fw = fs.createWriteStream(`${newPath}/${fileName}`)
      result.stream
      .pipe(fw)
      .on('finish', (img) => {
        resolve(img)
      })
    })
  }

  resize = async (...args) =>
    resize(this.original || await NI(this.path), ...args)

}

function resize(image, size) {
  let current = image.getSize()
  let delta = current.width - current.height
  let target = delta > 0 ? 'height' : 'width'

  if (size >= current[target]) size = current[target]

  image = image.resize({ [target]: size, quality: 'best' })

  current = image.getSize()
  delta = current.width - current.height

  if (delta === 0) return image

  let position = { x: 0, y: 0, width: size, height: size }
  position[delta > 0 ? 'x' : 'y'] = ~~Math.abs(delta / 2)

  image = image.crop(position)

  return image
}

const isValidImage = (file) =>
  [MIME.JPG, MIME.PNG, MIME.SVG].includes(file.type)


const toImage = (src, mimetype) => {
  switch (mimetype) {
    case MIME.SVG:
      return SVG2NI(src)
    default:
      return NI(src)
  }
}

const load = (src) =>
  new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

const SVG2NI = (src) =>
  new Promise((resolve, reject) => {
    const svg = new Blob([src.toString('utf-8')], { type: MIME.SVG })
    const url = URL.createObjectURL(svg)

    load(url)
      .then(img => {
        try {
          const canvas = document.createElement('canvas')

          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight
          canvas
            .getContext('2d')
            .drawImage(img, 0, 0)

          resolve(
            nativeImage.createFromDataURL(canvas.toDataURL())
          )
        } catch (error) {
          reject(error)
        } finally {
          URL.revokeObjectURL(url)
        }

      })
      .catch(reason => {
        URL.revokeObjectURL(url)
        reject(reason)
      })
  })

const NI = (src) =>
  new Promise((resolve) => {
    resolve(typeof src === 'string' ?
      nativeImage.createFromPath(src) :
      nativeImage.createFromBuffer(src))
  })


const magic = (buffer) => {
  if (buffer != null || buffer.length > 24) {
    if (isJPG(buffer)) return MIME.JPG
    if (isPNG(buffer)) return MIME.PNG
    if (isSVG(buffer)) return MIME.SVG
  }
}

const isJPG = (b) => (
  b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF
)

const isPNG = (b) => (
  b.slice(0, 8).compare(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) === 0
)

const isSVG = (b) => (
  !isBinary(b) && SVG.test(b.toString().replace(CMT, ''))
)

// eslint-disable-next-line max-len
const SVG = /^\s*(?:<\?xml[^>]*>\s*)?(?:<!doctype svg[^>]*\s*(?:<![^>]*>)*[^>]*>\s*)?<svg[^>]*>/i
const CMT = /<!--([\s\S]*?)-->/g

const isBinary = (b) => {
  for (let i = 0; i < 24; ++i) {
    if (b[i] === 65533 || b[i] <= 8) return true
  }

  return false
}

module.exports = {
  Image,
  resize,
  isValidImage
}
