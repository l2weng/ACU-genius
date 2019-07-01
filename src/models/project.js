'use strict'

const assert = require('assert')
const { dirname } = require('path')
const uuid = require('uuid/v4')
const { all } = require('bluebird')
const { into, update } = require('../common/query')
const { info } = require('../common/log')
const { PROJECT } = require('../constants')

module.exports = {
  async create(db, { name, base, owner, id = uuid() }) {
    info(`saving project into local "${name}" #${id} owner:${owner}`)
    await db.read(PROJECT.SCHEMA)
    await db.run(...into('project').insert({
      project_id: id,
      name,
      owner,
      base
    }))
  },

  async load(db) {
    const [project, items] = await all([
      db.get(`
        SELECT project_id AS id, name, base, owner, synced FROM project LIMIT 1`),
      db.get(`
        SELECT COUNT (id) AS total
          FROM items LEFT OUTER JOIN trash USING (id)
          WHERE deleted IS NULL AND id!=-999`)
    ])

    assert(project != null, 'no project found')

    switch (project.base) {
      case 'project':
        project.base = dirname(db.path)
        break
      case 'user':
      case 'documents':
      case 'pictures':
        project.base = ARGS[project.base]
        break
    }

    project.items = items.total

    return project
  },

  save(db, { id, ...props }) {
    return db.run(
      ...update('project').set(props).where({ project_id: id })
    )
  }
}
