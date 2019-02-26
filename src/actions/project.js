'use strict'

const { PROJECT } =  require('../constants')
const OSS = require('ali-oss')

module.exports = {
  create(payload, meta) {
    return {
      type: PROJECT.CREATE,
      payload,
      meta: { ipc: true, ...meta }
    }
  },

  opened(payload, meta) {
    return {
      type: PROJECT.OPENED,
      error: (payload instanceof Error),
      payload,
      meta: { ipc: true, ...meta }
    }
  },

  open(payload, meta) {
    return { type: PROJECT.OPEN, payload, meta }
  },

  closed(payload, meta) {
    return { type: PROJECT.CLOSED, payload, meta }
  },

  close(payload, meta) {
    return {
      type: PROJECT.CLOSE,
      payload,
      meta,
      error: payload instanceof Error
    }
  },

  rebase(payload = {}, meta = {}) {
    return {
      type: PROJECT.REBASE,
      payload,
      meta: {
        cmd: 'project',
        history: 'add',
        ...meta
      }
    }
  },

  save(payload, meta = {}) {
    return {
      type: PROJECT.SAVE,
      payload,
      meta: {
        cmd: 'project',
        history: 'add',
        ...meta
      }
    }
  },

  sync(payload, meta = {}) {
    console.log(payload)
    return {
      type: PROJECT.SYNC,
      payload,
      meta
    }
  },

  update(payload, meta = {}) {
    return {
      type: PROJECT.UPDATE,
      payload,
      meta: { ipc: !!payload.name, ...meta }
    }
  },

  updateUserInfo(payload, meta = {}) {
    return {
      type: PROJECT.UPDATE_USER_INFO,
      payload,
      meta: { ...meta }
    }
  }

}
