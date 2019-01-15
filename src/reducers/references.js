'use strict'

const { PROJECT,PHOTO } = require('../constants')
const { load  } = require('./util')

module.exports = {
  // eslint-disable-next-line complexity
  references(state = {}, { type, payload, error, meta }) {
    switch (type) {
      case PROJECT.OPEN:
        return {}

      case PHOTO.LOADREFERENCE:
        return load(state, payload, meta, error)

      default:
        return state
    }
  }
}
