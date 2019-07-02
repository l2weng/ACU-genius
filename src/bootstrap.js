'use strict'

const START = performance.now()

const { home, dev } = require('./args').parse()

const { info } = require('./common/log')
const { ready } = require('./dom')

ready.then(() => {
  const READY = performance.now()
  const INIT = Date.now()
  const { win } = require('./window')
  info(`initializing ${win.type} window...`)
  const LOAD = Date.now()

  win.init(() => {
    requestIdleCallback(() => {
      win.show()
      win.toggle('ready')
      win.ready = Date.now()
      info('%s ready %dms [dom:%dms win:%dms req:%dms]',
        win.type,
        win.ready - START,
        READY - START,
        INIT - READY,
        LOAD - INIT)
    }, { timeout: 2000 })
    const DONE = performance.now()

    info('%s ready after %dms (%dms)', win.type,
      (DONE - START).toFixed(3),
      (DONE - READY).toFixed(3))
  })
})

// eslint-disable-next-line
global.eval = function () {
  // allow eval for ali-oss
  // throw new Error('use of eval() is prohibited')
}

if (!dev) {
  global.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {}
}
