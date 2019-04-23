'use strict'

const { call, select, put } = require('redux-saga/effects')
const { Command } = require('./command')
const mod = require('../models')
const { REFERENCES } = require('../constants')
const act = require('../actions')

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

module.exports = {
  Load
}
