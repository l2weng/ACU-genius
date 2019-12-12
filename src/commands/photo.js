'use strict'

const assert = require('assert')
const { all, call, put, select } = require('redux-saga/effects')
const { remote } = require('electron')
const { Command } = require('./command')
const { ImportCommand } = require('./import')
const { fail, open } = require('../dialog')
const mod = require('../models')
const act = require('../actions')
const { PHOTO } = require('../constants')
const { Image: OldImage } = require('../image')
const { Image } = require('../image/image')
const { DuplicateError } = require('../common/error')
const { info, warn } = require('../common/log')
const { blank, pick, pluck, splice } = require('../common/util')
const { getPhotoTemplate, getTemplateValues } = require('../selectors')
const { keys, values } = Object
const { getNewOOSClient } = require('../common/dataUtil')
const { error } = require('../common/log')
const uuid = require('uuid/v4')
const { basename, dirname, join, relative, resolve } = require('path')
const nodePath = require('path')
const axios = require('axios')
const { existsSync: exists } = require('fs')
const { stat } = require('fs').promises

class Consolidate extends ImportCommand {
  static get ACTION() { return PHOTO.CONSOLIDATE }

  lookup = async (photo, paths = {}, checkFileSize) => {
    let dir = dirname(photo.path)
    let file = basename(photo.path)

    for (let [from, to] of Object.entries(paths)) {
      let rel = relative(from, dir)

      for (let x of to) {
        try {
          let candidate = join(resolve(x, rel), file)
          let { size } = await stat(candidate)
          let isMatch = !checkFileSize || (size === photo.size)

          if (isMatch) {
            return candidate
          } else {
            info({ path: candidate }, 'skipped consolidation candidate')
          }
        } catch (e) {
          if (e.code !== 'ENOENT') throw e
        }
      }
    }
  }

  *resolve(photo) {
    let { meta } = this.action
    let path = yield call(this.lookup, photo, meta.paths, true)

    if (!path && meta.prompt) {
      try {
        this.suspend()

        let paths = yield call(open.images, {
          properties: ['openFile']
        })
        path = (paths != null) ? paths[0] : null

        if (path) {
          let from = dirname(photo.path)
          let to = dirname(path)

          if (from !== to && basename(photo.path) === basename(path)) {
            let res = yield call(prompt, 'photo.consolidate')
            if (res.ok) {
              yield put(act.photo.consolidate(null, {
                paths: { [from]: [to] }
              }))
            }
          }
        }
      } finally {
        this.resume()
      }
    }

    return path
  }

  *exec() {
    let { db } = this.options
    let { payload, meta } = this.action
    let consolidated = []

    let [project, photos, selections] = yield select(state => [
      state.project,
      blank(payload) ? values(state.photos) : pluck(state.photos, payload),
      state.selections
    ])

    for (let i = 0, total = photos.length; i < total; ++i) {
      let photo = photos[i]
      if (photo.path && !exists(photo.path) && photo.syncFileUrl) {
        const app = remote.app
        let newPath = nodePath.join(app.getPath('userData'), `project/${project.fileUuid}`)
        let newFileName = nodePath.win32.basename(photo.path)
        yield OldImage.download(photo.path, photo.syncFileUrl, newFileName, newPath)
        photo.path = `${newPath}/${newFileName}`
      }

      try {
        let { image, hasChanged, error } =
          yield this.checkPhoto(photo, meta.force)

        if (meta.force || hasChanged) {
          if (error != null) {
            warn({ stack: error.stack }, `failed to open photo ${photo.path}`)

            let path = yield this.resolve(photo)
            if (path) {
              image = yield call(Image.open, { path, page: photo.page })
            }
          }

          if (image != null) {
            hasChanged = (image.checksum !== photo.checksum) ||
              (image.path !== photo.path)

            if (meta.force || hasChanged) {
              yield* this.createThumbnails(photo.id, image, {
                overwrite: hasChanged
              })

              for (let id of photo.selections) {
                if (id in selections) {
                  yield* this.createThumbnails(selections[id].labelId, image, {
                    overwrite: hasChanged,
                    selection: selections[id]
                  })
                }
              }

              let data = { id: photo.id, path: photo.path, ...image.toJSON() }

              yield call(mod.photo.save, db, data, project)
              yield put(act.photo.update({
                path: photo.path,
                broken: false,
                consolidated: new Date(),
                ...data
              }))

            } else {
              yield put(act.photo.update({
                id: photo.id, broken: true, consolidated: new Date()
              }))
            }

            consolidated.push(photo.id)

          } else {
            yield put(act.photo.update({
              id: photo.id, broken: true, consolidated: new Date()
            }))
          }
        }
      } catch (e) {
        warn({ stack: e.stack }, `failed to consolidate photo ${photo.id}`)
        fail(e, this.action.type)
      }

      yield put(act.activity.update(this.action, { total, progress: i + 1 }))
    }

    return consolidated
  }
}


class Create extends ImportCommand {
  static get ACTION() { return PHOTO.CREATE }

  *exec() {
    let { db } = this.options
    let { item, files } = this.action.payload
    let { idx } = this.action.meta

    let photos = []

    if (idx == null) {
      idx = [yield select(state => state.items[item].photos.length)]
    }

    if (!files) {
      this.isInteractive = true
      files = yield call(open.images)
    }

    if (!files) return []

    let [base, template] = yield select(state => [
      state.project.base,
      getPhotoTemplate(state)
    ])

    let data = getTemplateValues(template)

    for (let i = 0, total = files.length; i < total; ++i) {
      let file
      let image
      let photo

      try {
        file = files[i]
        image = yield call(Image.open, { path: file })


        yield* this.handleDuplicate(image)

        photo = yield call(db.transaction, tx =>
          mod.photo.create(tx, { base, template: template.id }, {
            item, image, data, position: idx[0] + i + 1
          }))

        yield put(act.metadata.load([photo.id]))

        yield all([
          put(act.photo.insert(photo, { idx: [idx[0] + photos.length] })),
          put(act.activity.update(this.action, { total, progress: i + 1 }))
        ])

        photos.push(photo.id)

        yield* this.createThumbnails(photo.id, image)

      } catch (error) {
        if (error instanceof DuplicateError) continue

        warn(`Failed to import "${file}": ${error.message}`, {
          stack: error.stack
        })

        fail(error, this.action.type)
      }
    }

    yield put(act.item.photos.add({ id: item, photos }, { idx }))

    this.undo = act.photo.delete({ item, photos })
    this.redo = act.photo.restore({ item, photos }, { idx })

    return photos
  }
}

class RefCreate extends ImportCommand {
  static get ACTION() { return PHOTO.REFERENCE_CREATE }

  *exec() {
    let { db } = this.options
    let { files, tag_id } = this.action.payload
    let { idx } = this.action.meta

    let photos = []
    let item = -999

    if (idx == null) {
      idx = [yield select(state => Object.keys(state.references).length)]
    }

    if (!files) {
      this.isInteractive = true
      files = yield call(open.images)
    }

    if (!files) return []

    let [base, template] = yield select(state => [
      state.project.base,
      getPhotoTemplate(state)
    ])

    let data = getTemplateValues(template)

    for (let i = 0, total = files.length; i < total; ++i) {
      let file
      let image
      let photo

      try {
        file = files[i]
        image = yield call(Image.open, { path: file })


        yield* this.handleDuplicate(image)

        photo = yield call(db.transaction, tx =>
          mod.photo.refCreate(tx, { base, template: template.id }, {
            item, image, data, position: idx[0] + i + 1, tag_id
          }))

        yield all([
          put(act.photo.insert(photo, { idx: [idx[0] + photos.length] })),
          put(act.activity.update(this.action, { total, progress: i + 1 }))
        ])

        photos.push(photo.id)

        yield* this.createThumbnails(photo.id, image, { isReference: true })

      } catch (error) {
        if (error instanceof DuplicateError) continue

        warn(`Failed to import "${file}": ${error.message}`, {
          stack: error.stack
        })

        fail(error, this.action.type)
      }
    }

    yield put(act.references.load({ tag_id }))
    this.undo = act.photo.delete({ item, photos })
    this.redo = act.photo.restore({ item, photos }, { idx })

    return photos
  }
}

class Delete extends Command {
  static get ACTION() { return PHOTO.DELETE }

  *exec() {
    const { db } = this.options
    const { item, photos } = this.action.payload

    let order = yield select(state => state.items[item].photos)
    let idx = photos.map(id => order.indexOf(id))

    order = order.filter(id => !photos.includes(id))

    yield call([db, db.transaction], async tx => {
      await mod.photo.delete(tx, photos)
      await mod.photo.order(tx, item, order)
    })

    yield put(act.item.photos.remove({ id: item, photos }))
    this.undo = act.photo.restore({ item, photos }, { idx })
  }
}

class Duplicate extends ImportCommand {
  static get ACTION() { return PHOTO.DUPLICATE }

  *exec() {
    let { db } = this.options
    let { payload } = this.action
    let { item } = payload

    assert(!blank(payload.photos), 'missing photos')

    let [base, order, originals, data] = yield select(state => [
      state.project.base,
      state.items[item].photos,
      pluck(state.photos, payload.photos),
      pluck(state.metadata, payload.photos)
    ])

    let idx = [order.indexOf(payload.photos[0]) + 1]
    let total = originals.length
    let photos = []

    for (let i = 0; i < total; ++i) {
      const { template, path } = originals[i]

      try {
        let image = yield call(Image.open, { path: path })


        let photo = yield call(db.transaction, tx =>
          mod.photo.create(tx, { base, template }, {
            item,
            image,
            data: data[i]
          }))

        yield put(act.metadata.load([photo.id]))

        yield all([
          put(act.photo.insert(photo, { idx: [idx[0] + photos.length] })),
          put(act.activity.update(this.action, { total, progress: i + 1 }))
        ])

        photos.push(photo.id)
        yield* this.createThumbnails(photo.id, image)

      } catch (error) {
        warn(`Failed to duplicate "${path}": ${error.message}`, {
          stack: error.stack
        })

        fail(error, this.action.type)
      }
    }

    yield call(mod.photo.order, db, item, splice(order, idx[0], 0, ...photos))
    yield put(act.item.photos.add({ id: item, photos }, { idx }))

    this.undo = act.photo.delete({ item, photos })
    this.redo = act.photo.restore({ item, photos }, { idx })

    return photos
  }
}

class Load extends Command {
  static get ACTION() { return PHOTO.LOAD }

  *exec() {
    const { db } = this.options
    const { payload } = this.action
    const { project } = yield select()

    const photos = yield call(db.seq, conn =>
      mod.photo.load(conn, payload, project))

    return photos
  }
}

class Move extends Command {
  static get ACTION() { return PHOTO.MOVE }

  *exec() {
    const { db } = this.options
    const { photos, item } = this.action.payload

    let { idx } = this.action.meta
    let { order, original } = yield select(state => ({
      order: state.items[item].photos,

      // Assuming all photos being moved from the same item!
      original: state.items[photos[0].item]
    }))

    const ids = photos.map(photo => photo.id)

    idx = (idx == null || idx < 0) ? order.length : idx
    order = splice(order, idx, 0, ...ids)

    yield call([db, db.transaction], async tx => {
      await mod.photo.move(tx, { item, ids })
      await mod.photo.order(tx, item, order)
    })

    yield all([
      put(act.photo.bulk.update([ids, { item }])),
      put(act.item.photos.remove({ id: original.id, photos: ids })),
      put(act.item.photos.add({ id: item, photos: ids }, { idx }))
    ])
    this.undo = act.photo.move({
      photos: photos.map(({ id }) => ({ id, item })),
      item: original.id
    }, {
      // Restores all photos at the original position of the first
      // of the moved photos. Adjust if we want to support moving
      // arbitrary selections!
      idx: original.photos.indexOf(ids[0])
    })
  }
}

class Order extends Command {
  static get ACTION() { return PHOTO.ORDER }

  *exec() {
    const { db } = this.options
    const { item, photos } = this.action.payload

    const original = yield select(state => state.items[item].photos)

    yield call(mod.photo.order, db, item, photos)
    yield put(act.item.update({ id: item, photos }))
    this.undo = act.photo.order({ item, photos: original })
  }
}

class Save extends Command {
  static get ACTION() { return PHOTO.SAVE }

  *exec() {
    let { db } = this.options
    let { payload, meta } = this.action
    let { id, data } = payload

    let [original, project] = yield select(state => [
      pick(state.photos[id], keys(data)),
      state.project
    ])

    const params = { id, timestamp: meta.now, ...data }

    yield call(db.transaction, async tx => {
      await mod.photo.save(tx, params, project)
      await mod.image.save(tx, params)
    })

    this.undo = act.photo.save({ id, data: original })

    return { id, ...data }
  }
}

class Restore extends Command {
  static get ACTION() { return PHOTO.RESTORE }

  *exec() {
    const { db } = this.options
    const { item, photos } = this.action.payload

    // Restore all photos in a batch at the former index
    // of the first photo to be restored. Need to differentiate
    // if we support selecting multiple photos!
    let [idx] = this.action.meta.idx
    let order = yield select(state => state.items[item].photos)

    order = splice(order, idx, 0, ...photos)

    yield call([db, db.transaction], async tx => {
      await mod.photo.restore(tx, { item, ids: photos })
      await mod.photo.order(tx, item, order)
    })

    yield put(act.item.photos.add({ id: item, photos }, { idx }))

    this.undo = act.photo.delete({ item, photos })
  }
}

class Sync extends Command {
  static get ACTION() { return PHOTO.SYNC }

  *exec() {
    let { payload } = this.action
    const { db } = this.options
    const { force } = payload
    const { project } = yield select()
    let syncPhotos = []
    let syncPhotosResult = {}
    if (project.synced || force) {
      const photos = yield call(db.seq, conn =>
        mod.photo.load(conn, null, project))
      const { userInfo } = ARGS
      let photosArray = []
      for (let i in photos) {
        photosArray.push(photos[i])
      }
      let total = photosArray.length
      for (let i = 0; i < photosArray.length; i++) {
        let sPhoto = photosArray[i]
        if (!sPhoto.syncPhotoId || force) {
          let client = getNewOOSClient()
          try {
            let result = { res: { status: 500 }, url: sPhoto.syncFileUrl }
            if (!sPhoto.syncFileUrl) {
              result = yield client.put(uuid(), sPhoto.path)
            }
            let syncPhoto = {
              syncStatus: true,
              syncFileUrl: result.url,
              syncFileName: nodePath.win32.basename(sPhoto.path)
              .split('.')
              .slice(0, -1)
              .join('.'),
              size: sPhoto.size,
              width: sPhoto.width,
              height: sPhoto.height,
              mimeType: sPhoto.mimetype,
              protocol: sPhoto.protocol,
              fileUrl: sPhoto.path,
              orientation: sPhoto.orientation,
              tasks: sPhoto.tasks,
              photoId: sPhoto.syncPhotoId,
              userId: userInfo.user.userId,
              projectId: project.syncProjectId,
            }
            const syncResult = yield axios.post(
              `${ARGS.apiServer}/photos/syncPhoto`, syncPhoto)
            if (syncResult.status === 200) {
              yield call(mod.photo.syncPhoto, db, sPhoto.id, result.url,
                syncResult.data.obj.photoId)
              sPhoto.syncFileUrl = result.url
              sPhoto.syncPhotoId = syncResult.data.obj.photoId
              syncPhotos.push(sPhoto)
              syncPhotosResult[sPhoto.id] = sPhoto
            }
            yield put(act.activity.update(this.action, { total, progress: i + 1 }))
          } catch (e) {
            error(e.toString())
          }
        } else {
          yield put(act.activity.update(this.action, { total, progress: i + 1 }))
        }
      }
      yield put(act.references.sync(payload))
    }
    const ids = syncPhotos.map(photo => photo.id)
    return [ids, syncPhotosResult]
  }
}

class LabelSync extends Command {
  static get ACTION() { return PHOTO.LABEL_SYNC }

  *exec() {
    let { payload } = this.action
    const { db } = this.options
    const { photo, photoSpendTime, userId } = payload
    const { userInfo } = ARGS
    const selections = yield call(db.seq, conn =>
      mod.selection.load(conn, photo.selections))
    const labels = []
    for (let i in selections) {
      selections[i].photoId = photo.syncPhotoId
      selections[i].userId = userInfo.user.userId
      labels.push(selections[i])
    }
    try {
      const result  = yield axios.post(`${ARGS.apiServer}/labels/savePhotoLabels`, { photoId: photo.syncPhotoId, spendTime: photoSpendTime, labels, myTaskId: photo.tasks[0], userId })
      if (result.status === 200) {
        const savedLabels = result.data.obj
        yield call(mod.selection.update, db, photo.id, savedLabels)
        yield call(mod.photo.updatePhoto, db, photo.id, PHOTO.STATUS.SUBMITTED)
        payload.photo.labelSynced = true
        payload.photo.workStatus = PHOTO.STATUS.SUBMITTED
        let updatedPayload = {}
        updatedPayload[photo.id] = payload.photo
        yield put(act.photo.labelSyncSuccess(updatedPayload))
      }
    } catch (e) {
      error(e.toString())
    }
  }
}

class LabelSkip extends Command {
  static get ACTION() { return PHOTO.LABEL_SKIP }

  *exec() {
    let { payload } = this.action
    const { db } = this.options
    let { photo, photoSpendTime, userId } = payload
    try {
      const result  = yield axios.post(`${ARGS.apiServer}/labels/skipLabel`, { photoId: photo.syncPhotoId, spendTime: photoSpendTime, myTaskId: photo.tasks[0], userId })
      if (result.status === 200) {
        yield call(mod.photo.updatePhoto, db, photo.id, PHOTO.STATUS.SKIPPED)
        payload.photo.labelSynced = true
        payload.photo.workStatus = PHOTO.STATUS.SKIPPED
        let updatedPayload = {}
        updatedPayload[photo.id] = payload.photo
        yield put(act.photo.labelSyncSuccess(updatedPayload))
      }
    } catch (e) {
      error(e.toString())
    }
  }
}

module.exports = {
  Consolidate,
  RefCreate,
  Create,
  Delete,
  Duplicate,
  Load,
  Move,
  Order,
  Restore,
  Sync,
  LabelSync,
  LabelSkip,
  Save
}
