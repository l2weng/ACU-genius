'use strict'

const PIXI = require('pixi.js/dist/pixi.js')
const { Container, Graphics } = PIXI
const BLANK = Object.freeze({})
const { TOOL, getSelectionColors } = require('../../constants/esper')

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

  drawPoint(
    color,
    scale = 1,
    point,
  ) {
    this.beginFill('0xFFFFFF')
    this.lineStyle(scale, '0xFFFFFF', 0)
    this.drawCircle(point.x, point.y, 6)
    this.endFill()
  }

  drawFirstPoint(
    color,
    scale = 1,
    point,
    points,
  ) {
    this.beginFill('0xFF0000')
    this.lineStyle(scale, '0xFF0000', 0)
    this.drawCircle(point.x, point.y, 6)
    this.interactive = true
    this.buttonMode = true
    this.on('pointerdown', ()=>this.handlePolygonClose(color, scale, points))
  }

  handlePolygonClose(color, scale, points) {
    const colors = getSelectionColors(color ? color : this.color).selection[this.state]
    for (let i = 0; i < this.parent.children.length; i++) {
      this.parent.children[i].clear()
    }
    this.parent.startPolygon = false
    this.beginFill(...colors.fill)
    this.lineStyle(scale, ...colors.line, 0)
    this.drawPolygon([...points, points[0], points[1]])
    this.endFill()
    this.parent.finishPolygon()
    this.interactive = false
  }

  drawLine(
    color,
    scale = 1,
    points,
  ) {
    const colors = getSelectionColors(color ? color : this.color).selection[this.state]
    this.clear()
    this.beginFill(...colors.fill)
    this.lineStyle(scale, ...colors.line, 0)
    this.drawPolygon(points)
  }
}

class PolygonLayer extends Container {
  constructor(color) {
    super()
    this.visible = false
    this.color = color
    this.points = []
    this.startPolygon = false
    this.complete = false
  }

  drawLayerPoint({ point } = BLANK) {
    const scale = 1 / this.parent.scale.y
    if (this.points.length === 0) {
      this.startPolygon = true
      this.children[0].drawFirstPoint(this.color, scale, point, this.points)
    } else {
      this.children[1].drawPoint(this.color, scale, point, this.points)
    }
    this.points.push(point.x)
    this.points.push(point.y)
  }

  drawLayerLine({ point } = BLANK) {
    if (this.startPolygon) {
      const scale = 1 / this.parent.scale.y
      this.children[2].drawLine(this.color, scale, [...this.points, point.x, point.y])
    }
  }

  finishPolygon() {
    this.complete = true
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
