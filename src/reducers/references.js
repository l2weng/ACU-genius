'use strict'

const { PROJECT, REFERENCES } = require('../constants')
const { packageIdx  } = require('./util')

module.exports = {
  // eslint-disable-next-line complexity
  references(state = {}, { type, payload, error, meta }) {
    switch (type) {
      case PROJECT.OPEN:
        return []

      case REFERENCES.LOADED:
        return packageIdx(payload)

      default:
        return state
    }
  }
}
