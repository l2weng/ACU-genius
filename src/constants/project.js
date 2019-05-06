'use strict'

const { join } = require('path')

module.exports = {
  CLOSE: 'project.close',
  CLOSED: 'project.closed',
  CREATE: 'project.create',
  UPLOAD: 'project.upload',
  CREATED: 'project.created',
  OPEN: 'project.open',
  OPENED: 'project.opened',
  REBASE: 'project.rebase',
  SAVE: 'project.save',
  UPDATE: 'project.update',
  PROJECTS_CACHE: 'project.projectCache',
  UPDATE_USER_INFO: 'project.updateUserInfo',
  SYNC: 'project.sync',
  UPDATE_SYNC_STATUS: 'project.updateSyncStatus',

  MODE: {
    HOME: 'home',
    PROJECT: 'project',
    ITEM: 'item'
  },

  MIGRATIONS: join(__dirname, '..', '..', 'db', 'migrate', 'project'),
  SCHEMA: join(__dirname, '..', '..', 'db', 'schema', 'project.sql')
}
