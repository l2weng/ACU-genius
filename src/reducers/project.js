'use strict'
const { getOOSConfig } = require('../common/dataUtil')
const OSS = require('ali-oss')
const { error } = require('../common/log')

const { PROJECT, ITEM } = require('../constants')
const INIT = { name: '', items: 0 }

function dec(state, by = 1) {
  return { ...state, items: Math.max(0, state.items - by) }
}

function inc(state, by = 1) {
  return { ...state, items: state.items + by }
}

function upload(state, payload) {
  console.log('我先来的!!!!!')
  let { project } = payload
  // let projectMeta = { id: meta.seq, init: meta.now, type: 'project.upload', progress: 0, total: 1 }
  //call project upload

  let client = new OSS(getOOSConfig())
  async function putOOS() {
    try {
      return await client.put(project.name, project.file)
    } catch (e) {
      error(e)
    }
  }
  putOOS().then(res=>{
    if (res.res.status === 200) {
      return { ...state }
    }
  })
  return { ...state }
}


module.exports = {
  // eslint-disable-next-line complexity
  project(state = INIT, { type, payload, meta, error }) {
    switch (type) {
      case PROJECT.OPENED:
        return { ...payload }
      case PROJECT.UPDATE:
        return { ...state, ...payload }
      case PROJECT.UPDATE_USER_INFO:
        return { ...state, ...payload }
      case PROJECT.OPEN:
      case PROJECT.CLOSE:
        return { ...state, closing: true }
      case PROJECT.CLOSED:
        return { ...state, closed: new Date() }
      case PROJECT.UPLOAD:
        return upload(state, payload, meta)
      case ITEM.INSERT:
        return inc(state)
      case ITEM.RESTORE:
        return (!error && meta.done) ? inc(state, payload.length) : state
      case ITEM.DELETE:
        return (!error && meta.done) ? dec(state, payload.length) : state

      case ITEM.MERGE:
      case ITEM.IMPLODE:
        return (!error && meta.done) ? dec(state, meta.dec) : state
      case ITEM.EXPLODE:
      case ITEM.SPLIT:
        return (!error && meta.done) ? inc(state, meta.inc) : state

      default:
        return state
    }
  }
}
