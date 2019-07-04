'use strict'

const assert = require('assert')
const { relative, resolve } = require('path')
const { TEMPLATE } = require('../constants/photo')
const { DC } = require('../constants')
const { all } = require('bluebird')
const { text, date } = require('../value')
const metadata = require('./metadata')
const bb = require('bluebird')
const { assign } = Object
const subject = require('./subject')
const { into, select, update } = require('../common/query')
const { normalize } = require('../common/os')
const { blank, empty, pick } = require('../common/util')

const COLUMNS = [
  'checksum',
  'mimetype',
  'orientation',
  'path',
  'size'
]

const skel = (id, selections = [], notes = [], labels = {}, tasks = []) => ({
  id, selections, notes, labels, tasks
})

module.exports = {
  async create(db, { base, template }, { item, image, data, position, tag_id }) {
    let {
      path, checksum, mimetype, width, height, orientation, size
    } = image

    let { id } = await db.run(
      ...into('subjects').insert({ template: template || TEMPLATE })
    )

    if (base != null) {
      path = relative(base, path)
    }

    await db.run(...into('images').insert({ id, width, height }))

    await all([
      db.run(...into('photos').insert({
        id,
        item_id: item,
        path,
        size,
        checksum,
        mimetype,
        tag_id,
        orientation,
        position
      })),

      metadata.update(db, {
        ids: [id],
        data: {
          [DC.title]: text(image.title),
          [DC.date]: date(image.date),
          ...data
        }
      })
    ])

    return (await module.exports.load(db, [id], { base }))[id]
  },

  async refCreate(db, { base, template }, { item, image, data, position, tag_id }) {
    let {
      path, checksum, mimetype, width, height, orientation, size
    } = image

    let { id } = await db.run(
      ...into('subjects').insert({ template: template || TEMPLATE, type: 'reference' })
    )

    if (base != null) {
      path = relative(base, path)
    }

    await db.run(...into('images').insert({ id, width, height }))

    await all([
      db.run(...into('photos').insert({
        id,
        item_id: item,
        path,
        size,
        checksum,
        mimetype,
        tag_id,
        orientation,
        position
      })),

      metadata.update(db, {
        ids: [id],
        data: {
          [DC.title]: text(image.title),
          [DC.date]: date(image.date),
          ...data
        }
      })
    ])

    return (await module.exports.loadReference(db, [id], { base }))[id]
  },

  async save(db, { id, timestamp, ...data }, { base } = {}) {
    let photo = pick(data, COLUMNS)
    let image = pick(data, ['width', 'height'])

    assert(id != null, 'missing photo id')
    if (empty(photo)) return

    if (base != null && photo.path != null) {
      photo.path = relative(base, photo.path)
    }

    await db.run(...update('photos').set(photo).where({ id }))

    if (!empty(image)) {
      await db.run(...update('images').set(image).where({ id }))
    }

    if (timestamp != null) {
      await subject.touch(db, { id, timestamp })
    }
  },

  async load(db, ids, { base } = {}) {
    const photos = {}
    let labelObj = {}
    if (ids != null) ids = ids.join(',')

    await all([
      db.each(`
        SELECT
            id,
            item_id AS item,
            template,
            datetime(created, "localtime") AS created,
            datetime(modified, "localtime") AS modified,
            angle,
            mirror,
            negative,
            brightness,
            contrast,
            hue,
            syncFileUrl,
            syncPhotoId,
            saturation,
            width,
            height,
            path,
            size,
            protocol,
            mimetype,
            checksum,
            orientation
          FROM subjects
            JOIN images USING (id)
            JOIN photos USING (id)${
            ids != null ? ` WHERE id IN (${ids}) and tag_id isnull` : ' where tag_id isnull'
        }`,
        ({ id, created, modified, mirror, negative, path, ...data }) => {
          data.created = new Date(created)
          data.modified = new Date(modified)
          data.mirror = !!mirror
          data.negative = !!negative
          data.path = (base) ? resolve(base, normalize(path)) : path

          if (id in photos) assign(photos[id], data)
          else photos[id] = assign(skel(id), data)
        }
      ),

      db.each(`
        SELECT id AS selection, labelId AS label, updatedTime AS updatedT,x AS x, y AS y, photo_id AS id
          FROM selections
            LEFT OUTER JOIN trash USING (id)
          WHERE ${ids != null ? `photo_id IN (${ids}) AND` : ''}
            deleted IS NULL
          ORDER BY photo_id, position`,
        ({ selection, label, id, updatedT, x, y }) => {
          if (id in photos) {
            labelObj[label] = { updatedTime: updatedT, x: x, y: y }
            photos[id].labels = (labelObj)
            photos[id].selections.push(selection)
          } else photos[id] = skel(id, [selection])
        }
      ),
      //
      // db.each(`
      //   SELECT id, note_id AS note
      //     FROM notes
      //     WHERE ${ids != null ? `id IN (${ids}) AND` : ''} deleted IS NULL
      //     ORDER BY id, created`,
      //   ({ id, note }) => {
      //     if (id in photos) photos[id].notes.push(note)
      //     else photos[id] = skel(id, [], [note])
      //   }
      // )
      db.each(`
        select lists.list_id as taskId, lists.sync_task_id as syncTaskId, items.id as item
          from lists as lists
          left join list_items as items where lists.list_id = items.list_id
          and items.id in (SELECT item_id AS item FROM subjects
                                               JOIN images USING (id)
                                               JOIN photos USING (id))`,
        ({ taskId, syncTaskId, item }) => {
          let id = item + 1
          let task = syncTaskId
          if (id in photos) photos[id].tasks.push(task)
          else photos[id] = skel(id, [], [], [], [task])
        }
      )
    ])
    return photos
  },

  async loadOnePhoto(db) {
    return db.get(
      'SELECT id,path FROM photos LIMIT 1'
    )
  },

  async loadOne(db, syncPhotoId) {
    let photo = {}

    await all([
      db.each(`
        SELECT
            id,
            angle,
            mirror
          FROM subjects
            JOIN images USING (id)
            JOIN photos USING (id)${
            ` WHERE syncPhotoId = '${syncPhotoId}' and tag_id isnull`
        }`,
        ({ mirror, ...data }) => {
          data.mirror = !!mirror
          photo = data
        }
      ),
    ])
    return photo
  },

  async loadReference(db, tag = null, { base } = {}) {
    if (!tag) return []
    let { tag_id } = tag
    const photos = {}

    await all([
      db.each(`
        SELECT
            id,
            item_id AS item,
            tag_id AS tagId,
            template,
            datetime(created, "localtime") AS created,
            datetime(modified, "localtime") AS modified,
            angle,
            mirror,
            negative,
            brightness,
            contrast,
            hue,
            saturation,
            width,
            height,
            path,
            size,
            protocol,
            mimetype,
            checksum,
            orientation
          FROM subjects
            JOIN images USING (id)
            JOIN photos USING (id)${
            tag_id != null ? ` WHERE tag_id = ${tag_id} order by tag_id` : ' where tag_id notnull order by tag_id'
        }`,
        ({ id, created, modified, mirror, negative, path, ...data }) => {
          data.created = new Date(created)
          data.modified = new Date(modified)
          data.mirror = !!mirror
          data.negative = !!negative
          data.path = (base) ? resolve(base, normalize(path)) : path

          if (id in photos) assign(photos[id], data)
          else photos[id] = assign(skel(id), data)
        }
      ),
    ])

    return photos
  },

  async loadTagsReference(db) {
    const photos = []

    await all([
      db.each(`
        SELECT
    id,
    p.tag_id as tagId,
    t.syncSkuId as syncSkuId,
    syncPhotoId,
    path
    FROM photos as p left join tags as t where p.tag_id=t.tag_id and p.tag_id notnull order by p.tag_id
`,
        ({ ...data }) => {
          photos.push(data)
        }
      ),
    ])

    return photos
  },

  find(db, { checksum }) {
    return db.get(`
      SELECT p.id, item_id AS item
        FROM photos p
          LEFT OUTER JOIN trash tp USING (id)
          LEFT OUTER JOIN trash ti ON (ti.id = item_id)
        WHERE checksum = ?
          AND tp.deleted IS NULL
          AND ti.deleted IS NULL`, checksum)
  },

  async move(db, { ids, item }) {
    return db.run(`
      UPDATE photos SET item_id = ?  WHERE id in (${ids.join(',')})`,
      item)
  },

  async order(db, item, photos, offset = 0) {
    if (!blank(photos)) {
      return db.run(`
        UPDATE photos
          SET position = CASE id
            ${photos.map((_, idx) =>
              (`WHEN ? THEN ${offset + idx + 1}`)).join(' ')}
            END
          WHERE item_id = ?`,
        ...photos, item)
    }
  },

  async merge(db, item, photos, offset = 0) {
    if (!blank(photos)) {
      return db.run(`
        UPDATE photos
          SET item_id = ?, position = CASE id
            ${photos.map((_, idx) =>
              (`WHEN ? THEN ${offset + idx + 1}`)).join(' ')}
            END
          WHERE id IN (${photos.join(',')})`,
        item, ...photos)
    }
  },

  async split(db, item, items, concurrency = 4) {
    return bb.map(items, ({ id, photos }) =>
      db.run(`
        UPDATE photos
          SET item_id = ?, position = CASE id
            ${photos.map((_, idx) =>
              (`WHEN ? THEN ${idx + 1}`)).join(' ')}
            END
          WHERE id IN (${photos.join(',')})`,
        id, ...photos), { concurrency })
  },

  async delete(db, ids) {
    return db.run(`
      INSERT INTO trash (id)
        VALUES ${ids.map(id => `(${id})`).join(',')}`)
  },

  async restore(db, { ids }) {
    return db.run(`
      DELETE FROM trash WHERE id IN (${ids.join(',')})`)
  },

  async prune(db) {
    return db.run(`
      DELETE FROM subjects
        WHERE id IN (
          SELECT id FROM trash JOIN photos USING (id)
        )`
    )
  },

  async rebase(db, base, oldBase) {
    let delta = []

    await db.each(select('id', 'path').from('photos').query, ({ id, path }) => {
      let oldPath = oldBase ? resolve(oldBase, normalize(path)) : path
      let newPath = base ? relative(base, oldPath) : oldPath
      if (newPath !== path) {
        delta.push({ id, path: newPath })
      }
    })

    await bb.map(delta, ({ id, path }) => db.run(
      ...update('photos').set({ path }).where({ id })
    ))
  },

  async syncPhoto(db, id, syncFileUrl, syncPhotoId) {
    return await db.run(
      ...update('photos').set({ syncFileUrl, syncPhotoId }).where({ id }))
  }
}
