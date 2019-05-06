'use strict'

const { PROJECT } =  require('../constants')

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

  cacheProjects(payload, meta) {
    return {
      type: PROJECT.PROJECTS_CACHE,
      error: (payload instanceof Error),
      payload,
      meta: { ipc: true, ...meta }
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
    return {
      type: PROJECT.SYNC,
      payload,
      meta: {
        cmd: 'project',
        ...meta
      }
    }
  },

  upload(payload, meta = {}) {
    return {
      type: PROJECT.UPLOAD,
      payload,
      meta: { ...meta }
    }
  },

  updateSyncStatus(payload, meta = {}) {
    return {
      type: PROJECT.UPDATE_SYNC_STATUS,
      payload,
      meta: { ...meta }
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
