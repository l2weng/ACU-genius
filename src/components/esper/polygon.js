'use strict'

const PIXI = require('pixi.js/dist/pixi.js')
const { Container, Graphics } = PIXI
const BLANK = Object.freeze({})
const BLANK_ARRAY = []
const { COLOR, TOOL, getSelectionColors } = require('../../constants/esper')

class Polygon extends Graphics {
  constructor(color) {
    super()
    this.data = BLANK
    this.polygonArray = BLANK_ARRAY
    this.lineArray = BLANK_ARRAY
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
    point,
  ) {
    this.beginFill('0xFF0000')
    this.lineStyle(scale, '0xFF0000', 0)
    this.drawCircle(point.x, point.y, 5)
    this.polygonArray.push(point.x)
    this.polygonArray.push(point.y)
    this.endFill()
  }

  updateLine(
    color,
    scale = 1,
    point,
  ) {
    const colors = getSelectionColors(color ? color : this.color).selection[this.state]
    this.clear()
    this.beginFill(...colors.fill)
    this.lineStyle(scale, ...colors.line, 0)
    this.drawPolygon(this.polygonArray.concat([point.x, point.y]))
    this.endFill()
  }
}

class PolygonLayer extends Container {
  constructor(color) {
    super()
    this.visible = false
    this.color = color
  }

  update({ point } = BLANK) {
    const scale = 1 / this.parent.scale.y
    this.children[0].update(this.color, scale, point)
  }

  updateLine({ point } = BLANK) {
    const scale = 1 / this.parent.scale.y
    this.children[1].updateLine(this.color, scale, point)
  }

  destroy() {
    super.destroy({ children: true })
  }

  isVisible({ selection, tool }) {
    return selection == null && (
      tool === TOOL.ARROW || tool === TOOL.SELECT || tool === TOOL.POLYGON
    )
  }

  isInteractive({ tool }) {
    return tool === TOOL.ARROW
  }

  sync(props) {
    this.color = props.shapeColor
    this.visible = this.isVisible(props)
    this.interactive = this.isInteractive(props)

    const { polygons } = props
    this.addChild(new Polygon(props.shapeColor))
  }
}



module.exports = {
  Polygon,
  PolygonLayer
}
