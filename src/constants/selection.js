'use strict'

module.exports = {
  CREATE: 'selection.create',
  DELETE: 'selection.delete',
  SYNC_DELETE: 'selection.syncDelete',
  LOAD: 'selection.load',
  ORDER: 'selection.order',
  RESTORE: 'selection.restore',
  SAVE: 'selection.save',
  SYNC: 'selection.sync',
  LOAD_FROM_CLOUD: 'selection.loadFromCloud',

  NOTE: {
    ADD: 'selection.note.add',
    REMOVE: 'selection.note.remove'
  },

  STATUS: {
    NEW: 0,
    UPDATE: 1,
    DELETE: 2,
    SAVED: 3
  },

  TEMPLATE: 'https://tropy.org/v1/templates/selection'
}
