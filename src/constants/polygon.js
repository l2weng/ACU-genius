'use strict'

module.exports = {
  CREATE: 'polygon.create',
  DELETE: 'polygon.delete',
  SYNC_DELETE: 'polygon.syncDelete',
  LOAD: 'polygon.load',
  ORDER: 'polygon.order',
  RESTORE: 'polygon.restore',
  SAVE: 'polygon.save',
  SYNC: 'polygon.sync',
  LOAD_FROM_CLOUD: 'polygon.loadFromCloud',

  STATUS: {
    NEW: 0,
    UPDATE: 1,
    DELETE: 2,
    SAVED: 3
  },

  TEMPLATE: 'https://www.labelreal.com/v1/templates/polygon'
}
