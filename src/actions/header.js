'use strict'

const { HEAD } = require('../constants')

module.exports = {

  load(payload, meta) {
    return {
      type: HEAD.LOAD,
      payload,
      meta: { cmd: 'project', ...meta }
    }
  },

  restore(payload = {}) {
    return {
      type: HEAD.RESTORE,
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

