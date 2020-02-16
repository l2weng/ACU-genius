'use strict'

const { list } = require('../common/util')
const { TEMPLATE } = require('../constants/selection')
const { all } = require('bluebird')
const { assign } = Object
const uuid = require('uuid/v4')

const mod = {
  selection: {
    async load(db, ids) {
      const selections = {}

      await all([
        db.each(`
          SELECT
              id,
              photo_id AS photo,
              x,
              y,
              skuId,
              spendTime,
              status,
              width,
              height,
              angle,
              mirror,
              negative,
              brightness,
              contrast,
              labelId,
              updatedTime,
              color,
              hue,
              saturation,
              template,
              datetime(created, "localtime") AS created,
              datetime(modified, "localtime") AS modified
            FROM subjects
              JOIN images USING (id)
              JOIN selections USING (id)${
          (ids != null) ? ` WHERE id IN (${list(ids)})` : ''
        }`,
        ({ id, created, modified, mirror, negative, ...data }) => {
          data.created = new Date(created)
          data.modified = new Date(modified)
          data.mirror = !!mirror
          data.negative = !!negative

          if (id in selections) assign(selections[id], data)
          else selections[id] = assign({ id, notes: [] }, data)
        }),

        // db.each(`
        //   SELECT id, note_id AS note
        //     FROM notes JOIN selections USING (id)
        //     WHERE ${(ids != null) ? `id IN (${list(ids)}) AND` : ''}
        //       deleted IS NULL
        //     ORDER BY id, created`,
        //   ({ id, note }) => {
        //     if (id in selections) selections[id].notes.push(note)
        //     else selections[id] = { id, notes: [note] }
        //   }
        // )
      ])

      return selections
    },

    async create(db, template, { photo, x, y, width, height, angle, mirror, labelId, updatedTime, color, status, skuId, spendTime, polygon }) {
      const { id } = await db.run(`
        INSERT INTO subjects (template) VALUES (?)`, template || TEMPLATE)

      await db.run(`
        INSERT INTO images (id, width, height, angle, mirror)
          VALUES (?,?,?,?,?)`, [id, width, height, angle, mirror])

      await db.run(`
        INSERT INTO selections (id, photo_id, x, y, labelId, updatedTime, color, status, skuId, spendTime, polygon)
          VALUES (?,?,?,?,?,?,?,?,?,?,?)`, [id, photo, x, y, labelId ? labelId : uuid(), updatedTime, color, status, skuId, spendTime, polygon])

      return (await mod.selection.load(db, [id]))[id]
    },

    async order(db, photo, selections, offset = 0) {
      if (selections.length) {
        return db.run(`
          UPDATE selections
            SET position = CASE id
              ${selections.map((_, idx) =>
                (`WHEN ? THEN ${offset + idx + 1}`)).join(' ')}
              END
            WHERE photo_id = ?`,
          ...selections, photo)
      }
    },

    async update(db, photo, labels) {
      if (labels.length) {
        return db.run(`
          UPDATE selections
            SET status = CASE id
              ${labels.map(label =>
            (`WHEN ${label.id} THEN ${label.status}`)).join(' ')}
              END
            WHERE photo_id = ?`, photo)
      }
    },

    async delete(db, ...ids) {
      return db.run(`
        INSERT INTO trash (id)
          VALUES ${ids.map(id => `(${id})`).join(',')}`)
    },

    async loadOne(db, ...ids) {
      return db.get(
        `SELECT id,labelId,status FROM selections where id=${ids}`
      )
    },

    async loadSome(db, ...ids) {
      let selections = {}
      await all([
        db.each(
        `SELECT id,labelId,status,updatedTime FROM selections WHERE id in (${ids.join(',')})`,
        ({ id, labelId, status, updatedTime }) => {
          selections[labelId] = { id, status, updatedTime }
        }
      )
      ])
      return selections
    },

    async restore(db, ...ids) {
      return db.run(`
        DELETE FROM trash WHERE id IN (${list(ids)})`
      )
    },

    async prune(db) {
      return db.run(`
        DELETE FROM subjects
          WHERE id IN (
            SELECT id FROM trash JOIN selections USING (id)
          )`
      )
    }
  }
}

module.exports = mod.selection
