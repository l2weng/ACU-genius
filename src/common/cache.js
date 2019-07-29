'use strict'

const { mkdir, readdir, stat, writeFile } = require('fs').promises
const { join, extname, basename } = require('path')

class Cache {
  constructor(...args) {
    this.root = join(...args)
  }

  get name() {
    return basename(this.root)
  }

  init = async () => {
    try {
      await mkdir(this.root, { recursive: true })
    } catch (error) {
      if (error.code !== 'EEXIST') throw error
    }

    return this
  }

  save = (name, data) =>
    writeFile(this.expand(name), data)

  exists = (name = '', expand = true) =>
    stat(expand ? this.expand(name) : name)
    .then(() => true, () => false)

  list = (opts = {}) =>
    readdir(this.root, opts)

  stats = async () => {
    let stats = []
    let files = await this.list()

    for (let file of files) {
      stats.push([
        file,
        await stat(this.expand(file))
      ])
    }

    return stats
  }

  expand(...args) {
    return join(this.root, ...args)
  }


  extname(...args) {
    return Cache.extname(...args)
  }

  path(...args) {
    return Cache.path(...args)
  }

  url(...args) {
    return Cache.url(this.root, ...args)
  }

  static extname() {
    return '.webp'
  }

  static path(id, variant, ext) {
    return `${id}_${variant}${ext}`
  }

  static split(path) {
    let ext = extname(path)
    return [...basename(path, ext).split('_', 2), ext]
  }

  static url(root, id, variant, mimetype) {
    return `file://${
      join(root, Cache.path(id, variant, Cache.extname(mimetype)))
    }`
  }
}

module.exports = {
  Cache
}
