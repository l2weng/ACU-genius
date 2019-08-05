'use strict'

const { call, put, select, all } = require('redux-saga/effects')
const { dirname, resolve, join, basename } = require('path')
const fs = require('fs')
const { Command } = require('./command')
const { PROJECT } = require('../constants')
const { pick } = require('../common/util')
const act = require('../actions')
const mod = require('../models')
const { getNewOOSClient, getFilesizeInBytes } = require('../common/dataUtil')
const { error } = require('../common/log')
const axios = require('axios')
const uuid = require('uuid/v4')
const { ipcRenderer: ipc  } = require('electron')
const { existsSync: exists } = require('fs')

class Rebase extends Command {
  static get ACTION() { return PROJECT.REBASE }

  *exec() {
    let { db, id } = this.options
    let { project } = yield select()

    // Temporary: only toggle between absolute and project-relative!
    let base = (project.base) ? null : dirname(project.file)

    yield call(db.transaction, async tx => {
      await mod.project.save(tx, { id, base: (base) ? 'project' : null })
      await mod.photo.rebase(tx, base, project.base)
    })

    yield put(act.project.update({ base }))
    this.undo = act.project.rebase()
  }
}

class Save extends Command {
  static get ACTION() { return PROJECT.SAVE }

  *exec() {
    let { payload } = this.action
    let { db, id } = this.options

    let original = yield select(state =>
      pick(state.project, Object.keys(payload)))

    let doRebase = ('base' in payload && payload.base !== original.base)

    yield call(db.transaction, async tx => {
      await mod.project.save(tx, { id, ...payload })

      if (doRebase) {
        await mod.photo.rebase(tx, payload.base, this.original.base)
      }
    })
    if (original.name !== payload.name) {
      let { project } = yield select()
      yield axios.post(`${ARGS.apiServer}/projects/update`, { name: payload.name, projectId: project.syncProjectId })
      ipc.send('cmd', 'app:sync-project-file')
    }
    yield put(act.project.update(payload))
    this.undo = act.project.save(original)
  }
}

class Sync extends Command {
  static get ACTION() { return PROJECT.SYNC }

  *exec() {
    let { payload } = this.action
    let { cache } = payload
    let { project } = yield select()
    let { db } = this.options
    let client = getNewOOSClient()
    let total = 1
    let { userInfo } = ARGS
    try {
      let syncProjectSize = 0
      if (fs.existsSync(project.file)) {
        syncProjectSize = getFilesizeInBytes(project.file)
      }
      let result = yield client.put(basename(project.file, '.lbr'), project.file)
      const firstPhoto = yield call(mod.photo.loadOnePhoto, db)

      let syncCover = ''
      if (cache) {
        const coverId = uuid()
        let coverResult = {}
        const cacheCoverPath = join(resolve(join(cache.root, project.id)), `${firstPhoto.id}_512.webp`)
        if (exists(cacheCoverPath)) {
          coverResult = yield client.put(coverId, cacheCoverPath)
        } else {
          return
        }
        syncCover = coverResult.url
      }
      if (result.res.status === 200) {
        let syncProject = {
          syncStatus: true,
          syncProjectFile: result.url,
          projectFile: project.file,
          itemCount: project.items,
          syncProjectId: project.syncProjectId,
          name: project.name,
          userId: userInfo.user.userId,
          syncProjectFileName: project.name,
          syncProjectSize,
          syncCover: syncCover
        }
        const syncResult = yield axios.post(`${ARGS.apiServer}/projects/syncProject`, syncProject)
        if (syncResult.status === 200) {
          yield all([
            call(mod.project.save, db, { id: project.id, synced: true }),
            put(act.project.updateSyncStatus({ ...payload, synced: 1 })),
            put(act.activity.update(this.action, { total, progress: 1 }))
          ])
        }
      }
    } catch (e) {
      error(e)
    }
  }
}

class SyncProjectFile extends Command {
  static get ACTION() { return PROJECT.SYNC_PROJECT_FILE }

  *exec() {
    let { payload } = this.action
    let { project } = yield select()
    let { db } = this.options
    let client = getNewOOSClient()
    let { userInfo } = ARGS
    if (project.synced) {
      console.log('sync project file start!!')
      try {
        let result = yield client.put(basename(project.file, '.lbr'), project.file)
        if (result.res.status === 200) {
          let syncProject = {
            syncStatus: true,
            syncProjectFile: result.url,
            projectFile: project.file,
            itemCount: project.items,
            syncProjectId: project.syncProjectId,
            name: project.name,
            userId: userInfo.user.userId,
            syncProjectFileName: project.name,
          }
          const syncResult = yield axios.post(`${ARGS.apiServer}/projects/syncProject`, syncProject)
          if (syncResult.status === 200) {
            yield all([
              call(mod.project.save, db, { id: project.id, synced: true, syncVersion: syncResult.data.obj.syncVersion }),
              put(act.project.updateSyncStatus({ ...payload, synced: 1 })),
            ])
            console.log('sync project file end!!')
          }
        }
      } catch (e) {
        error(e)
      }
    }
  }
}

module.exports = {
  Rebase,
  Save,
  Sync,
  SyncProjectFile
}
