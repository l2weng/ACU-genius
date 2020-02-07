'use strict'

const { SELECTION } = require('../constants')

module.exports = {
  create(payload, meta) {
    return {
      type: SELECTION.CREATE,
      payload,
      meta: {
        cmd: 'project',
        history: 'add',
        ...meta
      }
    }
  },

  delete(payload, meta) {
    return {
      type: SELECTION.DELETE,
      payload,
      meta: {
        cmd: 'project',
        history: 'add',
        ...meta
      }
    }
  },

  syncDelete(payload, meta) {
    return {
      type: SELECTION.SYNC_DELETE,
      payload,
      meta: {
        cmd: 'project',
        history: 'add',
        ...meta
      }
    }
  },

  load(payload, meta) {
    return {
      type: SELECTION.LOAD,
      payload,
      meta: {
        cmd: 'project',
        ...meta
      }
    }
  },

  sync(payload, meta) {
    return {
      type: SELECTION.SYNC,
      payload,
      meta: {
        cmd: 'project',
        ...meta
      }
    }
  },

  loadFromCloud(payload, meta) {
    return {
      type: SELECTION.LOAD_FROM_CLOUD,
      payload,
      meta: {
        cmd: 'project',
        ...meta
      }
    }
  },

  notes: {
    add(payload, meta = {}) {
      return { type: SELECTION.NOTE.ADD, payload, meta }
    },

    remove(payload, meta = {}) {
      return { type: SELECTION.NOTE.REMOVE, payload, meta }
    }
  },

  order(payload, meta) {
    return {
      type: SELECTION.ORDER,
      payload,
      meta: {
        cmd: 'project',
        history: 'merge',
        ...meta
      }
    }
  },

  restore(payload, meta) {
    return {
      type: SELECTION.RESTORE,
      payload,
      meta: {
        cmd: 'project',
        history: 'add',
        ...meta
      }
    }
  },

  save(payload, meta) {
    return {
      type: SELECTION.SAVE,
      payload,
      meta: { cmd: 'project', history: 'merge', ...meta }
    }
  },

  addPolygonPoint(payload, meta) {
    return {
      type: SELECTION.ADD_POLYGON_POINT,
      payload,
      meta: { cmd: 'project', history: 'merge', ...meta }
    }
  },

}
