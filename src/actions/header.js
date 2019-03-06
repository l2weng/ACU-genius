'use strict'

const { HEAD } = require('../constants')

module.exports = {
  restore(payload = {}) {
    return {
      type: HEAD.RESTORE,
      payload
    }
  },

  headerSwitch(payload = {}) {
    return {
      type: HEAD.SWITCH,
      payload
    }
  },

  loadProjects(payload = {}) {
    return {
      type: HEAD.PROJECTS,
      payload
    }
  }
}

