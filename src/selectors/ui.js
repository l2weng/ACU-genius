'use strict'

const { createSelector: memo } = require('reselect')
const { getVisiblePhotos } = require('./photos')
const { seq, compose, map, keep } = require('transducers.js')

const rev = (a, b) => a < b ? 1 : b < a ? -1 : 0

const getExpandedPhotos = memo(
  ({ ui }) => ui.expand,
  ({ ui }) => ui.panel.zoom > 0,
  getVisiblePhotos,
  (expand, isGrid, photos) => {
    const expanded = seq(photos, compose(
      map(photo => expand[photo.id] > 0 ? photo : null),
      keep()
    ))

    if (isGrid) {
      expanded.sort((a, b) => rev(expand[a.id], expand[b.id]))
    }

    return expanded
  }
)
module.exports = {
  getExpandedPhotos
}
