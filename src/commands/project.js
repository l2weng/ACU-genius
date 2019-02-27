'use strict'

const { call, put, select } = require('redux-saga/effects')
const { dirname } = require('path')
const { Command } = require('./command')
const { PROJECT } = require('../constants')
const { pick } = require('../common/util')
const act = require('../actions')
const mod = require('../models')


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

    yield put(act.project.update(payload))
    this.undo = act.project.save(original)
  }
}

class Sync extends Command {
  static get ACTION() { return PROJECT.SYNC }

  *exec() {
    let { payload, meta } = this.action
    let { photos, project } = payload
    let projectMeta = { id: meta.seq, init: meta.now, type: 'project.upload', progress: 0, total: 1 }
    yield put(act.project.upload(payload, projectMeta))
  }
}

module.exports = {
  Rebase,
  Save,
  Sync
}
