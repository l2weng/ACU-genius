'use strict'

const START = Date.now()

if (process.env.TROPY_RUN_UNIT_TESTS === 'true') {
  require('electron-mocha')

} else {
  let READY = undefined

  const args = require('./args')
  const opts = args.parse(process.argv.slice(1))

  process.env.NODE_ENV = opts.environment

  const { app, session } = require('electron')
  const { extname, join } = require('path')
  const { sync: mkdir } = require('mkdirp')
  const { exe, qualified, version } = require('../common/release')
  const { linux, darwin, system } = require('../common/os')

  let USERDATA = opts.dir
  let LOGDIR

  if (!USERDATA) {
    switch (opts.environment) {
      case 'development':
        USERDATA = join(process.cwd(), 'tmp')
        break
      case 'production':
        USERDATA = join(
          app.getPath('appData'),
          qualified[linux ? 'name' : 'product'])
        break
    }
  }

  // Set app name and data location as soon as possible!
  app.setName(qualified.product)
  if (!opts.data) {
    opts.data = join(app.getPath('appData'), exe)
  }
  let userData = join(opts.data, 'electron')
  mkdir(userData)
  app.setPath('userData', userData)

  if (!opts.cache) {
    opts.cache = join(app.getPath('cache'), exe)

    if (opts.cache === opts.data) { opts.cache = join(opts.data, 'cache') }
  }
  mkdir(opts.cache)
  app.setPath('userCache', opts.cache)

  if (!opts.logs) {
    try {
      opts.logs = join(app.getPath('logs', exe))
    } catch (_) {
      opts.logs = join(opts.data, 'log')
    }
  }
  mkdir(opts.logs)
  app.setPath('logs', opts.logs)

  if (!require('./squirrel')()) {
    const { all } = require('bluebird')
    const { once } = require('../common/util')
    const { info, warn } = require('../common/log')({
      dest: join(opts.logs, 'labelreal.log'),
      name: 'main',
      rotate: true,
      debug: opts.debug,
      trace: opts.trace,
    })

    if (opts.environment !== 'test') {
      if (!app.requestSingleInstanceLock()) {
        info('other instance detected, exiting...')
        app.exit(0)
      }
    }

    if (opts.ignoreGpuBlacklist) {
      app.commandLine.appendSwitch('ignore-gpu-blacklist')
    }

    if (opts.scale) {
      app.commandLine.appendSwitch('force-device-scale-factor', opts.scale)
    }

    info({
      opts,
      version,
    }, `main.init ${version} ${system}`)

    info(`using ${app.getPath('userData')}`)

    var labelReal = new (require('./labelReal'))(opts)

    labelReal.listen()
    labelReal.restore()

    if (darwin) {
      app.on('open-file', (event, file) => {
        switch (extname(file)) {
          case '.lbr':
            event.preventDefault()
            if (!READY) opts._ = [file]
            else labelReal.open(file)
            break
          case '.jpg':
          case '.jpeg':
          case '.png':
          case '.svg':
            if (READY && labelReal.win) {
              event.preventDefault()
              labelReal.import([file])
            }
            break
        }
      })
    }

    all([
      once(app, 'ready'),
      once(labelReal, 'app:restored'),

    ]).then(() => {
      // require('./server')
      session.defaultSession.webRequest.onHeadersReceived((res, cb) => {
        cb({
          responseHeaders: {
            ...res.responseHeaders,
            'Content-Security-Policy': [
              'default-src \'none\'',
              'base-uri \'none\'',
              'form-action \'none\'',
              'frame-ancestors \'none\'',
            ].join('; '),
          },
        })
      })

      READY = Date.now()
      info('ready after %sms', READY - START)
      labelReal.open(...opts._)
    })

    app.on('second-instance', (_, argv) => {
      labelReal.open(...args.parse(argv.slice(1))._)
    })

    app.on('quit', (_, code) => {
      info(`quit with exit code ${code}`)
    })
  }
}
