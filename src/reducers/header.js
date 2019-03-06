'use strict'

const { HEAD } = require('../constants')
const { merge } = require('../common/util')

const init = {
  activeTab: ''
}

module.exports = {
  header(state = init, { type, payload }) {
    switch (type) {
      case HEAD.RESTORE:
        return merge(init, payload)
      case HEAD.SWITCH: {
        return merge(state, payload)
      }
      default:
        return state
    }
  }
}
