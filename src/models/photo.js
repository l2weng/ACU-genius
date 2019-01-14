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

const skel = (id, selections = [], notes = []) => ({
  id, selections, notes
})

module.exports = {
  async create(db, { base, template }, { item, image, data, position }) {
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

  async save(db, { id, timestamp, ...data }, { base } = {}) {
    data = pick(data, COLUMNS)

    assert(id != null, 'missing photo id')
    if (empty(data)) return

    if (base != null && data.path != null) {
      data.path = relative(base, data.path)
    }

    await db.run(...update('photos').set(data).where({ id }))

    if (timestamp != null) {
      await subject.touch(db, { id, timestamp })
    }
  },

  async load(db, ids, { base } = {}) {
    const photos = {}
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
          ids != null ? ` WHERE id IN (${ids})` : ''
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
        SELECT id AS selection, photo_id AS id
          FROM selections
            LEFT OUTER JOIN trash USING (id)
          WHERE ${ids != null ? `photo_id IN (${ids}) AND` : ''}
            deleted IS NULL
          ORDER BY photo_id, position`,
        ({ selection, id }) => {
          if (id in photos) photos[id].selections.push(selection)
          else photos[id] = skel(id, [selection])
        }
      ),

      db.each(`
        SELECT id, note_id AS note
          FROM notes
          WHERE ${ids != null ? `id IN (${ids}) AND` : ''} deleted IS NULL
          ORDER BY id, created`,
        ({ id, note }) => {
          if (id in photos) photos[id].notes.push(note)
          else photos[id] = skel(id, [], [note])
        }
      )
    ])

    console.log(photos)
    return photos
  },

  async loadReference(db, tagId, { base } = {}) {
    const references = {}

    await all([
      db.each(`SELECT
       id,
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
       orientation,
       tag_id
FROM photos
       JOIN images USING (id) WHERE tag_id notnull`,
        ({ id, mirror, negative, path, ...data }) => {
          data.mirror = !!mirror
          data.negative = !!negative
          data.path = (base) ? resolve(base, normalize(path)) : path

          if (id in references) assign(references[id], data)
          else references[id] = assign(skel(id), data)
        }
      ),

    ])
    console.log(references)
    return references
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
  }
}
