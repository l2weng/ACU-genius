'use strict'

const PIXI = require('pixi.js/dist/pixi.js')
const { Container, Graphics, Polygon:PixiPolygon } = PIXI
const BLANK = Object.freeze({})
const { TOOL, getSelectionColors } = require('../../constants/esper')
const { round } = Math

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
    this.once('pointerdown', ()=>this.handlePolygonClose(color, scale, points))
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
    this.calculateBounds()
    this.parent.finishPolygon(this._localBounds.getRectangle())
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

  update(
    color,
    scale = 1,
    { polygon } = this.data,
    state = this.state,
  ) {
    this.clear()
    if (polygon.length === 0) return
    const colors = getSelectionColors(color ? color : this.color).selection[state]

    this.beginFill(...colors.fill)
    this.lineStyle(scale, ...colors.line, 0)
    this.drawPolygon([...polygon, polygon[0], polygon[1]])
  }

  sync(data = BLANK) {
    this.data = data
    if (this.isBlank || !this.parent.interactive) {
      this.interactive = false
      this.hitArea = null
    } else {
      this.interactive = true
      this.hitArea = new PixiPolygon(
        data.polygon
      )
    }
  }
}

class PolygonLayer extends Container {
  constructor(color) {
    super()
    this.visible = false
    this.color = color
    this.points = []
    this.rect = null
    this.startPolygon = false
    this.complete = false
  }

  drawLayerPoint({ point } = BLANK) {
    const scale = 1 / this.parent.scale.y
    if (this.points.length === 0) {
      this.startPolygon = true
      this.children[0].drawFirstPoint(this.color, scale, point, this.points)
    } else {
      this.children[0].drawPoint(this.color, scale, point, this.points)
    }
    this.points.push(round(point.x))
    this.points.push(round(point.y))
  }

  drawLayerLine({ point } = BLANK) {
    if (this.startPolygon) {
      const scale = 1 / this.parent.scale.y
      this.children[1].drawLine(this.color, scale, [...this.points, point.x, point.y])
    }
  }

  update({ polygon } = BLANK) {
    if (!this.children.length) return
    const scale = 1 / this.parent.scale.y
    let i = 0

    for (; i < this.children.length - 1; ++i) {
      this.children[i].update(this.children[i].data.color ? this.children[i].data.color : this.color, scale)
    }
    this.children[i].update(this.children[i].data.color ? this.children[i].data.color : this.color, scale, polygon,
      'live')
  }

  finishPolygon(rect) {
    this.rect = rect
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

    for (let i = 0; i < polygons.length; ++i) {
      if (i >= this.children.length) {
        this.addChild(new Polygon(props.shapeColor))
      }

      this.children[i].sync(polygons[i])
    }

    if (this.children.length <= polygons.length) {
      this.addChild(new Polygon(props.shapeColor))
    }

    this.children[polygons.length].sync(BLANK)

    if (this.children.length > polygons.length + 1) {
      for (let s of this.removeChildren(polygons.length + 1)) {
        s.destroy()
      }
    }
  }
}



module.exports = {
  Polygon,
  PolygonLayer
}
