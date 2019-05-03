'use strict'

const { put } = require('redux-saga/effects')
const { Command } = require('./command')
const { HEAD } = require('../constants')
const { remote } = require('electron')
const act = require('../actions')
const fs = require('fs')
const axios = require('axios')
const { getUrlFilterParams, getNewOOSClient, getFilesizeInBytes } = require('../common/dataUtil')
const { join } = require('path')
const { apiServer } = ARGS
const { error } = require('../common/log')

class LoadProjects extends Command {
  static get ACTION() { return HEAD.PROJECTS }

  * exec() {
    let { typeFlag, id } = this.action.payload
    let query
    query = typeFlag ?
      getUrlFilterParams({ userId: id }, ['userId']) :
      getUrlFilterParams({ machineId: id }, ['machineId'])
    let projects = []
    try {
      let response = yield axios.get(
        `${apiServer}/graphql?query={projectQueryByUser${query} { projectId name desc deadline projectFile type progress cover itemCount syncStatus syncCover remoteProjectFile localProjectId syncProjectFileName syncProjectFile syncProjectSize syncVersion isOwner } } `)
      if (response.status === 200) {
        projects = response.data.data.projectQueryByUser
        for (let i = 0; i < projects.length; i++) {
          const project = projects[i]
          //if project file is his own
          if (!fs.existsSync(project.projectFile)) {
            if (project.syncStatus) {
              const app = remote.app
              let client = getNewOOSClient()
              let newPath = app.getPath('userData')
              newPath = join(newPath, 'project')
              if (!fs.existsSync(newPath)) {
                fs.mkdir(newPath, { recursive: true }, (err) => {
                  if (err) throw err
                })
              }
              newPath = join(newPath, `${project.syncProjectFileName}.lbr`)
              if (!fs.existsSync(newPath)) {
                let result = yield client.get(project.localProjectId, newPath)
                if (result.res.status === 200) {
                  project.projectFile = newPath
                }
              }  else {
                project.projectFile = newPath
              }
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
          `${apiServer}/graphql?query={taskQueryByOwner${query}  { taskId name type localTaskId progress projectId createdAt workStatus project { projectId name deadline } }} `)
        if (response.status === 200) {
          tasks = response.data.data.taskQueryByOwner
        }
      } else if (type === HEAD.JOINED_TASKS) {
        response = yield axios.get(
          `${apiServer}/graphql?query={taskQueryByUser${query}  { taskId name type localTaskId progress projectId createdAt workStatus project { projectId name deadline } }} `)
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
