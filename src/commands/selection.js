'use strict'

const { call, put, select, all } = require('redux-saga/effects')
const { Command } = require('./command')
const { ImportCommand } = require('./import')
const { Image } = require('../image/image')
const mod = require('../models')
const act = require('../actions')
const { SELECTION } = require('../constants')
const { pick, splice } = require('../common/util')
const { keys } = Object
const axios = require('axios')
const _ = require('underscore')

class Create extends ImportCommand {
  static get ACTION() { return SELECTION.CREATE }

  *exec() {
    let { db } = this.options
    let { payload, meta } = this.action

    let photo = yield select(state => state.photos[payload.photo])
    let image = yield call(Image.open, photo)
    let idx = (meta.idx != null) ? meta.idx : [photo.selections.length]

    let selection = yield call(db.transaction, tx =>
      mod.selection.create(tx, null, payload))

    let data = { selections: [selection.id] }

    yield this.createThumbnails(selection.id, image, { selection })

    yield put(act.photo.selections.add({ id: photo.id, ...data }, { idx }))

    this.undo = act.selection.delete({ photo: photo.id, ...data }, { idx })
    this.redo = act.selection.restore({ photo: photo.id, ...data }, { idx })

    return selection
  }
}


class Sync extends Command {
  static get ACTION() { return SELECTION.SYNC }

  *exec() {
    const { db } = this.options
    const { payload } = this.action
    const { labels, photo } = payload
    const idx = yield select(state => state.photos[photo.id].selections.length)
    const originalPhoto = yield select(state => state.photos[photo.id])
    console.log(originalPhoto)
    const originalLabels = originalPhoto.labels
    let syncedSelections = []
    for (let i = 0; i < labels.length; i++) {
      let isNew = false
      const cloudLabel = labels[i]
      if (!originalLabels.hasOwnProperty(cloudLabel.labelId)) {
        if (cloudLabel.status === SELECTION.STATUS.NEW) {
          isNew = true
        }
      } else if (originalLabels[cloudLabel.labelId].updatedTime !==
        cloudLabel.updatedTime) {
        //todo update selection with cloud label includes two kinds of: 1. update, 2. remove
        if (cloudLabel.status === SELECTION.STATUS.DELETE) {
          const data = { selections: originalPhoto.selections }
          act.selection.delete({ photo: photo.id, ...data }, { idx })
        }
      }
      if (isNew) {
        const nPayload = {
          angle: photo.angle,
          mirror: photo.mirror,
          photo: photo.id,
          width: cloudLabel.width,
          height: cloudLabel.height,
          x: cloudLabel.x,
          y: cloudLabel.y,
          status: cloudLabel.status,
          updatedTime: cloudLabel.updatedTime,
          labelId: cloudLabel.labelId
        }
        const selection = yield call(db.transaction, tx =>
          mod.selection.create(tx, null, nPayload))
        const existedPhoto = selection.photo
        const selections = [selection.id]
        yield put(act.photo.selections.add({ id: existedPhoto, selections }, { idx }))
        syncedSelections.push(selection)
      }
    }
    return syncedSelections
  }
}

class Delete extends Command {
  static get ACTION() { return SELECTION.DELETE }

  *exec() {
    let { db } = this.options
    let { payload } = this.action
    let { photo, selections } = payload

    let ord = yield select(({ photos }) => photos[photo].selections)
    let idx = selections.map(id => ord.indexOf(id))

    ord = ord.filter(id => !selections.includes(id))

    yield call(db.transaction, async tx => {
      await mod.selection.delete(tx, ...selections)
      await mod.selection.order(tx, photo, ord)
    })

    yield put(act.photo.selections.remove({ id: photo, selections }))

    // this.undo = act.selection.restore(payload, { idx })
  }
}

class Load extends Command {
  static get ACTION() { return SELECTION.LOAD }

  *exec() {
    const { db } = this.options
    const { payload } = this.action

    const selections = yield call(db.seq, conn =>
      mod.selection.load(conn, payload))

    return selections
  }
}

class LoadFromCloud extends Command {
  static get ACTION() { return SELECTION.LOAD_FROM_CLOUD }

  *exec() {
    const { db } = this.options
    const { payload } = this.action
    const { listResult } = payload

    const listArr = Object.values(listResult)
    if (listArr.length > 0) {
      for (let i = 0; i < listArr.length; i++) {
        const oList = listArr[i]
        if (oList.id !== 0) {
          const labels = yield axios.post(`${ARGS.apiServer}/labels/queryLabels`, { taskId: oList.syncTaskId })
          const labelArr = labels.data
          if (labelArr.length > 0) {
            for (let j = 0; j < labelArr.length; j++) {
              const oLabel = labelArr[j]
              const photo = yield call(mod.photo.loadOne, db, oLabel.photoId )

              yield all([
                put(act.selection.sync({ photo, labels: oLabel.Labels })),
                put(act.activity.update(this.action, { total: labelArr.length, progress: j + 1 }))
              ])
            }
          }
        }
      }
    }
  }
}

class Order extends Command {
  static get ACTION() { return SELECTION.ORDER }

  *exec() {
    const { db } = this.options
    const { payload } = this.action
    const { photo, selections } = payload

    const cur = yield select(({ photos }) => photos[photo].selections)

    yield call(mod.selection.order, db, photo, selections)
    yield put(act.photo.update({ id: photo, selections }))

    this.undo = act.selection.order({ photo, selections: cur })
  }
}

class Restore extends Command {
  static get ACTION() { return SELECTION.RESTORE }

  *exec() {
    const { db } = this.options
    const { payload, meta } = this.action
    const { photo, selections } = payload

    // Restore all selections in a batch at the former index
    // of the first selection to be restored. Need to differentiate
    // if we support selecting multiple selections!
    let [idx] = meta.idx

    let ord = yield select(({ photos }) => photos[photo].selections)
    ord = splice(ord, idx, 0, ...selections)

    yield call(db.transaction, async tx => {
      await mod.selection.restore(tx, ...selections)
      await mod.selection.order(tx, photo, ord)
    })

    yield put(act.photo.selections.add({ id: photo, selections }, { idx }))

    this.undo = act.photo.delete(payload)
  }
}

class Save extends Command {
  static get ACTION() { return SELECTION.SAVE }

  *exec() {
    const { db } = this.options
    const { payload, meta } = this.action
    const { id, data } = payload

    const original = yield select(state =>
      pick(state.selections[id], keys(data)))

    yield call(db.transaction, tx =>
      mod.image.save(tx, { id, timestamp: meta.now, ...data }))

    this.undo = act.selection.save({ id, data: original })

    return { id, ...data }
  }
}


module.exports = {
  Create,
  Delete,
  Load,
  Order,
  Restore,
  Save,
  Sync,
  LoadFromCloud
}
