'use strict'

module.exports = {
  CONSOLIDATE: 'photo.consolidate',
  CONTRACT: 'photo.contract',
  CREATE: 'photo.create',
  REFERENCE_CREATE: 'photo.referenceCreate',
  DELETE: 'photo.delete',
  DUPLICATE: 'photo.duplicate',
  EXPAND: 'photo.expand',
  INSERT: 'photo.insert',
  LOAD: 'photo.load',
  LOAD_REFERENCE: 'photo.loadReference',
  MOVE: 'photo.move',
  ORDER: 'photo.order',
  RESTORE: 'photo.restore',
  SAVE: 'photo.save',
  SELECT: 'photo.select',
  UPDATE: 'photo.update',
  SYNC: 'photo.sync',
  LABEL_SYNC: 'photo.labelSync',
  LABEL_SKIP: 'photo.labelSkip',
  LABEL_SYNC_SUCCESS: 'photo.labelSyncSuccess',
  UPLOAD: 'photo.upload',
  REFERENCE_UPLOAD: 'photo.referenceUpload',

  BULK: {
    UPDATE: 'photo.bulk.update'
  },

  NOTE: {
    ADD: 'photo.note.add',
    REMOVE: 'photo.note.remove'
  },

  SELECTION: {
    ADD: 'photo.selection.add',
    REMOVE: 'photo.selection.remove'
  },

  STATUS: {
    OPEN: 0, SKIPPED: 1, SUBMITTED: 2,
    EN: { 0: 'Open', 1: 'Skipped', 2: 'Submitted' },
    CN: { 0: '未开始', 1: '跳过', 3: '已提交' }
  },

  TEMPLATE: 'https://tropy.org/v1/templates/photo'
}
