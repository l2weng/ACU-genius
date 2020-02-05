'use strict'

const PIXI = require('pixi.js/dist/pixi.js')
const { Container, Graphics, Rectangle } = PIXI
const BLANK = Object.freeze({})
const { COLOR, TOOL, getSelectionColors } = require('../../constants/esper')

class Polygon extends Graphics {
  constructor(color) {
    super()
    this.data = BLANK
    this.color = color
  }

  get isBlank() {
    return this.data === BLANK
  }

  get isActive() {
    return this === this.parent.active
  }

  get state() {
    if (this.isActive) return 'active'
    return 'default'
  }

  destroy() {
    this.data = null
    super.destroy({ children: true })
  }

  update(
    color,
    scale = 1,
    { x, y, width, height } = this.data,
    state = this.state,
  ) {
    this.clear()
    if (!width || !height) return
    const colors = getSelectionColors(color ? color : this.color).selection[state]

    this
      .lineStyle(scale, ...colors.line)
      .beginFill(...colors.fill)
      .drawRect(x, y, width, height)
  }
}




module.exports = {
  Polygon,
}
