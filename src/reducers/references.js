'use strict'

const { PROJECT, PHOTO } = require('../constants')
const { load  } = require('./util')

module.exports = {
  // eslint-disable-next-line complexity
  references(state = {}, { type, payload, error, meta }) {
    switch (type) {
      case PROJECT.OPEN:
        return {}

      default:
        return state
    }
  }
}

// case PHOTO.LOAD_REFERENCE:
// return load(state, payload, meta, error)

