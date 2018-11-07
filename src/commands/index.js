'use strict'

const { seq, map } = require('transducers.js')
const handles = map(([, cmd]) => [cmd.ACTION, cmd])

module.exports = {

  ...seq(require('./item'), handles),
  ...seq(require('./list'), handles),
  ...seq(require('./metadata'), handles),
  ...seq(require('./note'), handles),
  ...seq(require('./ontology'), handles),
  ...seq(require('./photo'), handles),
  ...seq(require('./project'), handles),
  ...seq(require('./selection'), handles),
  ...seq(require('./tag'), handles),

  exec(action, options) {
    return new module.exports[action.type](action, options).execute()
  }
}
