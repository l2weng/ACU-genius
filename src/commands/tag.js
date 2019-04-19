'use strict'

const { call, put, select } = require('redux-saga/effects')
const { Command } = require('./command')
const { TAG } = require('../constants')
const { pick } = require('../common/util')
const { keys } = Object
const mod = require('../models')
const act = require('../actions')
const axios = require('axios')
const { userInfo } = ARGS

class Load extends Command {
  static get ACTION() { return TAG.LOAD }

  *exec() {
    return (yield call(mod.tag.load, this.options.db, this.action.payload))
  }
}


class Create extends Command {
  static get ACTION() { return TAG.CREATE }

  *exec() {
    const { db } = this.options
    const { items, syncProjectId, ...data } = this.action.payload
    const hasItems = (items && items.length > 0)
    if (data.id != null) data['tag_id'] = data.id
    const tag = yield call(db.transaction, async tx => {
      const tg = await mod.tag.create(tx, data)
      if (hasItems) await mod.item.tags.add(tx, { id: items, tag: tg.id })
      return tg
    })
    let skuResult = yield axios.post(`${ARGS.apiServer}/skus/create`, { localSkuId: tag.id, name: tag.name, projectId: syncProjectId, userId: userInfo.user.userId })
    if (skuResult.status === 200) {
      console.log(skuResult)
      let updatePayload = { id: tag.id, syncSkuId: skuResult.data.obj.skuId }
      yield call(mod.tag.save, db, updatePayload)
    }
    if (hasItems) {
      yield put(act.item.tags.insert({ id: items, tags: [tag.id] }))
    }

    this.undo = act.tag.delete(tag.id)

    return tag
  }
}

class Save extends Command {
  static get ACTION() { return TAG.SAVE }

  *exec() {
    const { db } = this.options
    const { payload } = this.action

    this.original = yield select(({ tags }) =>
      pick(tags[payload.id], keys(payload)))

    yield put(act.tag.update(payload))
    yield call(mod.tag.save, db, payload)

    this.undo = act.tag.save(this.original)
  }

  *abort() {
    if (this.original) {
      yield put(act.tag.update(this.original))
    }
  }
}


class Delete extends Command {
  static get ACTION() { return TAG.DELETE }

  *exec() {
    const { db } = this.options
    const id = this.action.payload

    const items = yield call(mod.tag.items, db, id)
    const tag = yield select(({ tags }) => tags[id])

    yield call(mod.tag.delete, db, [id])

    if (items.length > 0) {
      yield put(act.item.tags.remove({ id: items, tags: [id] }))
    }

    this.undo = act.tag.create({ ...tag, items })

    return id
  }
}


module.exports = {
  Create,
  Delete,
  Load,
  Save
}
