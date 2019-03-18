'use strict'

const { HEAD } = require('../constants')
const { merge } = require('../common/util')

const init = {
  activeTab: HEAD.WORKSPACE
}

module.exports = {
  header(state = init, { type, payload }) {
    switch (type) {
      case HEAD.RESTORE:
        return merge(init, payload)
      case HEAD.SWITCH: {
        return merge(state, payload)
      }
      case HEAD.PROJECTS_LOADED: {
        return merge(state, payload)
      }
      case HEAD.TASKS_LOADED: {
        return merge(state, payload)
      }
      default:
        return state
    }
  }
}
