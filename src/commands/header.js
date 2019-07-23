'use strict'

const { put } = require('redux-saga/effects')
const { Command } = require('./command')
const { HEAD } = require('../constants')
const { remote } = require('electron')
const act = require('../actions')
const fs = require('fs')
const axios = require('axios')
const { getUrlFilterParams, getNewOOSClient } = require('../common/dataUtil')
const { join, basename, win32 } = require('path')
const { apiServer } = ARGS
const { error } = require('../common/log')
const args = require('../args')

class LoadProjects extends Command {
  static get ACTION() { return HEAD.PROJECTS }

  * exec() {
    const { typeFlag, id } = this.action.payload
    let { projectsCache } = ARGS
    let query
    query = typeFlag ?
      getUrlFilterParams({ userId: id }, ['userId']) :
      getUrlFilterParams({ machineId: id }, ['machineId'])
    let projects = []
    try {
      let response = yield axios.get(
        `${apiServer}/graphql?query={projectQueryByUser${query} { projectId name desc deadline projectFile type progress cover itemCount syncStatus syncCover remoteProjectFile localProjectId syncProjectFileName syncProjectFile syncProjectSize syncVersion isOwner fileUuid } } `)
      if (response.status === 200) {
        projects = response.data.data.projectQueryByUser
        const app = remote.app
        const client = getNewOOSClient()
        for (let i = 0; i < projects.length; i++) {
          const project = projects[i]
          let newPath = join(app.getPath('userData'), 'project')
          //if project file is his own
          if (!fs.existsSync(project.projectFile)) {
            if (project.syncStatus) {
              if (!fs.existsSync(newPath)) {
                fs.mkdir(newPath, { recursive: true }, (err) => {
                  if (err) throw err
                })
              }
              newPath = join(newPath, `${project.fileUuid}.lbr`)
              if (!fs.existsSync(newPath) || projectsCache[project.projectId] !== project.syncVersion) {
                yield client.get(project.fileUuid, newPath)
                projectsCache[project.projectId] = project.syncVersion
                args.update({ ...projectsCache })
                yield put(act.project.cacheProjects(projectsCache))
              }
              project.projectFile = newPath
            }
          }
        }
      }
      yield put(act.header.projectsLoaded({ projects }))
    } catch (err) {
      error(err.toString())
    }
  }
}

class LoadMyTasks extends Command {
  static get ACTION() { return HEAD.TASKS }

  * exec() {
    let { userId, type } = this.action.payload
    let query
    query = getUrlFilterParams({ userId: userId }, ['userId'])
    let tasks = []
    try {
      let response
      if (type === HEAD.MY_TASKS) {
        response = yield axios.get(
          `${apiServer}/graphql?query={taskQueryByOwner${query}  { taskId key:taskId name type localTaskId progress projectId createdAt workStatus project { projectId name deadline } }} `)
        if (response.status === 200) {
          tasks = response.data.data.taskQueryByOwner
        }
      } else if (type === HEAD.JOINED_TASKS) {
        response = yield axios.get(
          `${apiServer}/graphql?query={taskQueryByUser${query}  { taskId key:taskId name type localTaskId progress projectId createdAt workStatus project { projectId name deadline } }} `)
        if (response.status === 200) {
          tasks = response.data.data.taskQueryByUser
        }
      }
      yield put(act.header.tasksLoaded({ tasks }))
    } catch (err) {
      error(err.toString())
    }
  }
}


class Load extends Command {
  static get ACTION() { return HEAD.LOAD }

  *exec() {
    const { userInfo } = ARGS
    yield put(act.header.loadProjects({ typeFlag: true, id: userInfo.user.userId }))
    yield put(act.header.loadMyTasks({ userId: userInfo.user.userId, type: HEAD.MY_TASKS }))
  }
}

module.exports = {
  LoadProjects,
  LoadMyTasks,
  Load
}
