'use strict'

const { omit } = require('../common/util')
const { ACTIVITY,PROJECT,PHOTO } = require('../constants')

module.exports = {
  activities(state = {}, { type, payload, meta = {} }) {
    const { cmd, rel, seq, now, done, progress, total } = meta

    switch (true) {
      case (type === ACTIVITY.UPDATE):
        return {
          ...state,
          [rel]: { ...state[rel], ...payload }
        }

      case (type === PROJECT.UPLOAD):
        return {
          ...state,
          [seq]: {
            id: seq, type, init: now, progress, total
          }
        }

      case (type === PHOTO.UPLOAD):
        return {
          ...state,
          [seq]: {
            id: seq, type, init: now, progress, total
          }
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
