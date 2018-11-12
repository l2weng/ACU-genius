'use strict'

const { DATASET } =  require('../constants')


module.exports = {
  create(payload, meta) {
    return {
      type: DATASET.CREATE,
      payload,
      meta: { ipc: true, ...meta }
    }
  },

}
