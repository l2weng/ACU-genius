'use strict'

const { UI, HEAD } = require('../constants')

module.exports = {
  restore(payload, meta) {
    // Remove pre 1.3 state
    if (payload != null) {
      delete payload.image
      delete payload.note
    }

    return {
      type: UI.RESTORE,
      payload,
      meta
    }
  },

  headerSwitch(payload = {}) {
    return {
      type: HEAD.SWITCH,
      payload
    }
  },

  update(payload, meta) {
    return {
      type: UI.UPDATE,
      payload,
      meta: { throttle: true, log: 'silly', ...meta }
    }
  }
}
