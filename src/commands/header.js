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
        `${apiServer}/graphql?query={projectQueryByUser${query} { projectId name desc deadline projectFile type progress cover itemCount syncStatus syncCover remoteProjectFile localProjectId syncProjectFileName syncProjectFile syncProjectSize isOwner } } `)
      if (response.status === 200) {
        projects = response.data.data.projectQueryByUser
        for (let i = 0; i < projects.length; i++) {
          const project = projects[i]
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
            //if project file is his own
            if (fs.existsSync(project.projectFile)) {
              if (getFilesizeInBytes(project.projectFile) !== project.syncProjectSize) {
                let result = yield client.get(project.localProjectId, newPath)
                if (result.res.status === 200) {
                  project.projectFile = newPath
                }
              }
            } else {
              if (!fs.existsSync(newPath)) {
                let result = yield client.get(project.localProjectId, newPath)
                if (result.res.status === 200) {
                  project.projectFile = newPath
                }
              } else if (getFilesizeInBytes(newPath) !== project.syncProjectSize) {
                let result = yield client.get(project.localProjectId, newPath)
                if (result.res.status === 200) {
                  project.projectFile = newPath
                }
              } else {
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

module.exports = {
  LoadProjects,
}
