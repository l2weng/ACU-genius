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

  projectsLoaded(payload = {}) {
    console.log(payload)
    return {
      type: HEAD.PROJECTS_LOADED,
      payload
    }
  },

  loadProjects(payload = {}) {
    return {
      type: HEAD.PROJECTS,
      payload,
      meta: {
        cmd: 'project',
      }
    }
  }
}

