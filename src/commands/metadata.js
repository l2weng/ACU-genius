'use strict'

const { Command } = require('./command')
const { call, put, select } = require('redux-saga/effects')
const { pick } = require('../common/util')
const mod = require('../models/metadata')
const act = require('../actions/metadata')
const { LOAD, RESTORE, SAVE } = require('../constants/metadata')
const { keys } = Object


class Load extends Command {
  static get ACTION() { return LOAD }

  *exec() {
    const { db } = this.options
    const { payload } = this.action
    const data = yield call(mod.load, db, payload)
    return data
  }
}

class Restore extends Command {
  static get ACTION() { return RESTORE }

  *exec() {
    const { db } = this.options
    const { payload, meta } = this.action

    const ids = keys(payload)
    this.original = {}

    yield select(({ metadata }) => {
      for (let id of ids) {
        this.original[id] = pick(metadata[id], keys(payload[id]), {}, true)
      }
    })

    yield put(act.merge(payload))

    yield call(db.transaction, async tx => {
      for (let id of ids) {
        await mod.update(tx, {
          ids: [id],
          data: payload[id],
          timestamp: meta.now
        })
      }
    })

    this.undo = act.restore(this.original)

    return ids
  }

  *abort() {
    if (this.original) {
      yield put(act.merge(this.original))
    }
  }
}

class Save extends Command {
  static get ACTION() { return SAVE }

  *exec() {
    const { db } = this.options
    const { payload, meta } = this.action
    const { ids, data } = payload

    this.original = {}

    yield select(({ metadata }) => {
      const props = keys(data)

      for (let id of ids) {
        this.original[id] = pick(metadata[id], props, {}, true)
      }
    })

    yield put(act.update({ ids, data, }))

    yield call(db.transaction, tx =>
      mod.update(tx, {
        ids,
        data,
        timestamp: meta.now
      }))

    this.undo = act.restore(this.original)

    return ids
  }

  *abort() {
    if (this.original) {
      yield put(act.merge(this.original))
    }
  }
}


module.exports = {
  Load,
  Restore,
  Save
}
