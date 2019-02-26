'use strict'

const { join } = require('path')

module.exports = {
  CLOSE: 'project.close',
  CLOSED: 'project.closed',
  CREATE: 'project.create',
  CREATED: 'project.created',
  OPEN: 'project.open',
  OPENED: 'project.opened',
  REBASE: 'project.rebase',
  SAVE: 'project.save',
  UPDATE: 'project.update',
  UPDATE_USER_INFO: 'project.updateUserInfo',
  SYNC: 'project.sync',

  MODE: {
    HOME: 'home',
    PROJECT: 'project',
    ITEM: 'item'
  },

  MIGRATIONS: join(__dirname, '..', '..', 'db', 'migrate', 'project'),
  SCHEMA: join(__dirname, '..', '..', 'db', 'schema', 'project.sql')
}
