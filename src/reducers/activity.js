'use strict'

const { omit } = require('../common/util')
const { ACTIVITY } = require('../constants')

module.exports = {
  activities(state = {}, { type, payload, meta = {} }) {
    const { cmd, rel, seq, now, done, progress, total } = meta

    switch (true) {
      case (type === ACTIVITY.UPDATE):
        return {
          ...state,
          [rel]: { ...state[rel], ...payload }
        }

      case (done):
        return omit(state, [rel])

      case (cmd != null):
        return {
          ...state,
          [seq]: {
            id: seq, type, init: now, progress, total
          }
        }

      default:
        return state
    }
  }
}
