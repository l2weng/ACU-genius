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
    return {
      type: HEAD.PROJECTS_LOADED,
      payload
    }
  },

  tasksLoaded(payload = {}) {
    return {
      type: HEAD.TASKS_LOADED,
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
  },

  loadMyTasks(payload = {}) {
    return {
      type: HEAD.TASKS,
      payload,
      meta: {
        cmd: 'project',
      }
    }
  }
}

