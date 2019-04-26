'use strict'

const { all } = require('bluebird')
const { ROOT } = require('../constants/list')
const { into, select, update } = require('../common/query')
const { pick, remove, toId } = require('../common/util')
const mod = {}
const { userInfo } = ARGS
const __ = require('underscore')

module.exports = mod.list = {
  async all(db) {
    let lists = {}

    await db.each(
      ...select({ id: 'list_id', parent: 'parent_list_id', workers: 'workers', syncTaskId: 'sync_task_id' }, 'name')
        .from('lists')
        .order('parent, position'),
      ({ id, parent, name, syncTaskId, workers }) => {
        lists[id] = {
          id, parent, name, syncTaskId, workers, children: [], ...lists[id]
        }

        if (parent != null) {
          if (!(parent in lists)) {
            lists[parent] = { id: parent, children: [] }
          }
          lists[parent].children.push(id)
        }
      })

    return lists
  },

  async myAll(db) {
    let lists = {}

    await db.each(
      ...select({ id: 'list_id', parent: 'parent_list_id', workers: 'workers', syncTaskId: 'sync_task_id' }, 'name')
        .from('lists')
        .order('parent, position'),
      ({ id, parent, name, syncTaskId, workers }) => {
        if (!__.isEmpty(workers)) {
          let filteredResult = JSON.parse(workers).filter(worker=>worker.userId === userInfo.user.userId)
          if (filteredResult.length > 0) {
            lists[id] = {
              id, parent, name, syncTaskId, workers, children: [], ...lists[id]
            }
            if (parent != null) {
              if (!(parent in lists)) {
                lists[parent] = { id: parent, children: [] }
              }
              lists[parent].children.push(id)
            }
          }
        }
      })

    return lists
  },

  async create(db, { name, parent, position }) {
    let { id } = await db.run(
      ...into('lists')
        .insert({ name, parent_list_id: parent, position }))

    return { id, name, parent, children: [] }
  },

  async update(db, { syncTaskId, id }) {
    return db.run(
      ...update('lists')
      .set({ sync_task_id: syncTaskId })
      .where({ list_id: id }))
  },

  async updateOwner(db, { workers, syncTaskId }) {
    return db.run(
      ...update('lists')
      .set({ workers: workers })
      .where({ sync_task_id: syncTaskId }))
  },

  remove(db, id) {
    return db.run(
      ...update('lists')
        .set({ parent_list_id: null })
        .where({ list_id: id }))
  },

  restore(db, id, parent) {
    return db.run(
      ...update('lists')
        .set({ parent_list_id: parent })
        .where({ list_id: id }))
  },

  prune(db) {
    return db.seq(conn => all([
      conn.run(
        'DELETE FROM lists WHERE list_id != ? AND parent_list_id IS NULL', ROOT
      ),
      conn.run('DELETE FROM list_items WHERE deleted NOT NULL')
    ]))
  },

  save(db, { id, ...data }) {
    return db.run(
      ...update('lists')
        .set(pick(data, ['name', 'parent_list_id']))
        .set('modified = datetime("now")')
        .where({ list_id: id }))
  },

  order(db, parent, order) {
    if (order.length) {
      return db.run(`
        UPDATE lists
        SET position = CASE list_id
          ${order.map((_, idx) => (`WHEN ? THEN ${idx + 1}`)).join(' ')}
          END
        WHERE parent_list_id = ?`,
        ...order, parent)
    }
  },

  items: {
    async add(db, id, items) {
      let dupes = await db.all(
        ...select('id', 'deleted')
          .from('list_items')
          .where({ list_id: id, id: items }))

      let restores = dupes.filter(r => r.deleted).map(toId)
      if (restores.length > 0) {
        await mod.list.items.restore(db, id, restores)
      }

      items = remove(items, ...dupes.map(toId))

      let res = (items.length === 0) ?
        { changes: restores.length } :
        await db.run(`
          INSERT INTO list_items (list_id, id) VALUES ${
              items.map(it => `(${id}, ${it})`).join(',')
            }`)

      return {
        ...res,
        items: [...items, ...restores]
      }
    },

    remove(db, id, items) {
      return db.run(
        ...update('list_items')
          .set('deleted = datetime("now")')
          .where({ list_id: id, id: items.map(Number) }))
    },

    restore(db, id, items) {
      return db.run(
        ...update('list_items')
          .set({ deleted: null })
          .where({ list_id: id, id: items.map(Number) }))
    }
  }
}
