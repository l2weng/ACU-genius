'use strict'

const { call, put, select } = require('redux-saga/effects')
const { Command } = require('./command')
const mod = require('../models')
const act = require('../actions')
const { SELECTION } = require('../constants')
const { pick, splice } = require('../common/util')
const { keys } = Object
const _ = require('underscore')

class Create extends Command {
  static get ACTION() { return SELECTION.CREATE }

  *exec() {
    const { db } = this.options
    const { payload, meta } = this.action

    const idx = (meta.idx != null) ? meta.idx : [
      yield select(state => state.photos[payload.photo].selections.length)
    ]

    const selection = yield call(db.transaction, tx =>
      mod.selection.create(tx, null, payload))

    const photo = selection.photo
    const selections = [selection.id]

    yield put(act.photo.selections.add({ id: photo, selections }, { idx }))

    this.undo = act.selection.delete({ photo, selections }, { idx })
    this.redo = act.selection.restore({ photo, selections }, { idx })

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
    const existedLabels = yield select(state => state.photos[photo.id])
    const labelObjs = existedLabels.labels
    let syncedSelections = []
    for (let i = 0; i < labels.length; i++) {
      let isNew = false
      const label = labels[i]
      if (!labelObjs.hasOwnProperty(label.labelId)) {
        isNew = true
      } else {
        if (labelObjs[label.labelId].updatedTime !== label.updatedTime) {
          // console.log(yield select(state => state.photos[photo.id].selections)
        }
      }
      if (isNew) {
        const nPayload = {
          angle: photo.angle,
          mirror: photo.mirror,
          photo: photo.id,
          width: label.width,
          height: label.height,
          x: label.x,
          y: label.y,
          updatedTime: label.updatedTime,
          labelId: label.labelId
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
    const { db } = this.options
    const { payload } = this.action
    const { photo, selections } = payload

    let ord = yield select(({ photos }) => photos[photo].selections)
    let idx = selections.map(id => ord.indexOf(id))

    ord = ord.filter(id => !selections.includes(id))

    yield call(db.transaction, async tx => {
      await mod.selection.delete(tx, ...selections)
      await mod.selection.order(tx, photo, ord)
    })

    yield put(act.photo.selections.remove({ id: photo, selections }))

    this.undo = act.selection.restore(payload, { idx })
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
  Sync
}
