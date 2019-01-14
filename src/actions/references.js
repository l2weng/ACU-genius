'use strict'

const { REFERENCES, PHOTO } = require('../constants')

module.exports = {

  loadReference(payload, meta) {
    return {
      type: PHOTO.LOADREFERENCE,
      payload,
      meta: { cmd: 'project', ...meta }
    }
  },

  save(payload, meta) {
    return {
      type: REFERENCES.SAVE,
      payload,
      meta: { cmd: 'project', history: 'merge', ...meta }
    }
  },

  insert(payload, meta) {
    return {
      type: REFERENCES.INSERT,
      payload,
      meta: { ...meta }
    }
  },

}
