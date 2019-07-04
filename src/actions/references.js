'use strict'

const { REFERENCES } = require('../constants')

module.exports = {

  load(payload, meta) {
    return {
      type: REFERENCES.LOAD,
      payload,
      meta: { cmd: 'project', ...meta }
    }
  },

  loaded(payload, meta) {
    return {
      type: REFERENCES.LOADED,
      payload,
      meta: { ...meta }
    }
  },

  save(payload, meta) {
    return {
      type: REFERENCES.SAVE,
      payload,
      meta: { cmd: 'project', history: 'merge', ...meta }
    }
  },

  sync(payload, meta) {
    return {
      type: REFERENCES.SYNC,
      payload,
      meta: {
        cmd: 'project',
        ...meta
      }
    }
  },

  insert(payload, meta) {
    return {
      type: REFERENCES.INSERT,
      payload,
      meta: { ...meta }
    }
  }

}
