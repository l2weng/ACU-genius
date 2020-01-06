'use strict'

const { CONTEXT } = require('../constants')

module.exports = {
  show(event, scope = 'global', target, isOwner, meta) {
    return {
      type: CONTEXT.SHOW,
      payload: {
        scope,
        event: {
          target,
          x: event.clientX,
          y: event.clientY
        },
        isOwner: isOwner
      },
      meta: { ipc: true, ...meta }
    }
  },

  clear(payload, meta) {
    return { type: CONTEXT.CLEAR, payload, meta }
  }
}
