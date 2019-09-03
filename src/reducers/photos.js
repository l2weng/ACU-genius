'use strict'

const { METADATA, PHOTO, PROJECT } = require('../constants')
const { bulk, insert, load, nested, touch, update, bulkObj } = require('./util')

module.exports = {
  // eslint-disable-next-line complexity
  photos(state = {}, { type, payload, error, meta }) {
    switch (type) {
      case PROJECT.OPEN:
        return {}

      case PHOTO.LOAD:
        return load(state, payload, meta, error)

      case PHOTO.SAVE:
        return (!meta.done || error) ?
          state : {
            ...state,
            [payload.id]: {
              ...state[payload.id],
              ...payload,
              modified: new Date(meta.was)
            }
          }

      case PHOTO.INSERT:
        return insert(state, payload, meta)
      case PHOTO.UPDATE:
        return update(state, payload, meta)
      case PHOTO.UPLOAD:
        return update(state, payload, meta)
      case PHOTO.REFERENCE_UPLOAD:
        return update(state, payload, meta)
      case PHOTO.LABEL_SYNC_SUCCESS:
        return update(state, payload, meta)
      case PHOTO.NOTE.ADD:
        return nested.add('notes', state, payload, meta)
      case PHOTO.NOTE.REMOVE:
        return nested.remove('notes', state, payload, meta)

      case PHOTO.SELECTION.ADD:
        return nested.add('selections', state, payload, meta)
      case PHOTO.SELECTION.REMOVE:
        return nested.remove('selections', state, payload, meta)

      case PHOTO.BULK.UPDATE:
        console.log(payload)
        return bulk.update(state, payload, meta)

      case PHOTO.SYNC:
        console.log(payload)
        if (error || !meta.done) {
          return state
        }  else {
          return bulkObj.update(state, payload, meta)
        }

      case METADATA.SAVE:
      case METADATA.RESTORE:
        return touch(state, payload, meta, error)

      default:
        return state
    }
  }
}
