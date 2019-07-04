'use strict'

const { call, select, put } = require('redux-saga/effects')
const { Command } = require('./command')
const mod = require('../models')
const { REFERENCES } = require('../constants')
const act = require('../actions')
const { getNewOOSClient } = require('../common/dataUtil')
const { error } = require('../common/log')
const uuid = require('uuid/v4')
const nodePath = require('path')
const axios = require('axios')

class Load extends Command {
  static get ACTION() { return REFERENCES.LOAD }

  *exec() {
    const { db } = this.options
    const { payload } = this.action
    const { project } = yield select()
    const references = yield call(db.seq, conn =>
      mod.photo.loadReference(conn, payload, project))
    yield put(act.references.loaded(references))
  }
}

class Sync extends Command {
  static get ACTION() { return REFERENCES.SYNC }

  *exec() {
    let { payload } = this.action
    const { db } = this.options
    const { project } = yield select()
    const photosArray = yield call(db.seq, conn =>
      mod.photo.loadTagsReference(conn))
    const { userInfo } = ARGS
    let total = photosArray.length
    for (let i = 0; i < photosArray.length; i++) {
      let sPhoto = photosArray[i]
      let client = getNewOOSClient()
      try {
        let result = { res: { status: 500 }, url: sPhoto.syncFileUrl }
        if (!sPhoto.syncFileUrl) {
          result = yield client.put(uuid(), sPhoto.path)
        }
        let syncPhoto = {
          syncFileUrl: result.url,
          syncFileName: nodePath.win32.basename(sPhoto.path).split('.').slice(0, -1).join('.'),
          referenceId: sPhoto.syncPhotoId,
          userId: userInfo.user.userId,
          skuId: sPhoto.syncSkuId,
          fileUrl: sPhoto.path,
          fileType: REFERENCES.PHOTO_FILE_TYPE,
        }
        const syncResult = yield axios.post(`${ARGS.apiServer}/references/syncReferences`, syncPhoto)
        if (syncResult.status === 200) {
          yield call(mod.photo.syncPhoto, db, sPhoto.id, result.url, syncResult.data.obj.referenceId)
        }
        yield put(act.activity.update(this.action, { total, progress: i + 1 }))
      } catch (e) {
        error(e.toString())
      }
    }
    yield put(act.photo.upload(payload))
    yield put(act.project.sync(payload))
  }
}

module.exports = {
  Load,
  Sync
}
