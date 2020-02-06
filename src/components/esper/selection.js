'use strict'

const PIXI = require('pixi.js/dist/pixi.js')
const { Container, Graphics, Rectangle } = PIXI
const BLANK = Object.freeze({})
const { COLOR, TOOL, getSelectionColors } = require('../../constants/esper')


class SelectionLayer extends Container {
  constructor(color) {
    super()
    this.on('mousemove', this.handleMouseMove)
    this.visible = false
    this.color = color
  }

  update({ selection } = BLANK) {
    if (!this.children.length) return
    const scale = 1 / this.parent.scale.y
    let i = 0

    for (; i < this.children.length - 1; ++i) {
      this.children[i].update(this.children[i].data.color ? this.children[i].data.color : this.color, scale)
    }
    this.children[i].update(this.children[i].data.color ? this.children[i].data.color : this.color, scale, selection,
        'live')
  }

  addPolygonPoint(point) {
    const scale = 1 / this.parent.scale.y
    this.children[0].addPoint(this.children[0].data.color ? this.children[0].data.color : this.color, scale, point)
  }

  destroy() {
    super.destroy({ children: true })
  }

  handleMouseMove(event) {
    const { target } = event

    if (target instanceof Selection) {
      event.stopPropagation()
      this.active = target

    } else {
      this.active = null
    }
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

    const { selections } = props

    for (let i = 0; i < selections.length; ++i) {
      if (i >= this.children.length) {
        this.addChild(new Selection(props.shapeColor))
      }

      this.children[i].sync(selections[i])
    }

    if (this.children.length <= selections.length) {
      this.addChild(new Selection(props.shapeColor))
    }

    this.children[selections.length].sync(BLANK)

    if (this.children.length > selections.length + 1) {
      for (let s of this.removeChildren(selections.length + 1)) {
        s.destroy()
      }
    }
  }
}


class Selection extends Graphics {
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

  addPoint(
    color,
    scale = 1,
    point,
    state = this.state,
  ) {
    this.lineStyle(scale, '0xDE3249', 1)
    this.beginFill('0xDE3249')
    this.drawCircle(point.x, point.y, 8)
    this.endFill()
  }

  sync(data = BLANK) {
    this.data = data

    if (this.isBlank || !this.parent.interactive) {
      this.interactive = false
      this.hitArea = null
    } else {
      this.interactive = true
      this.hitArea = new Rectangle(
        data.x, data.y, data.width, data.height
      )
    }
  }
}


class SelectionOverlay extends Graphics {
  constructor({ width, height }) {
    super()

    this.beginFill(...COLOR.mask.fill)
    this.drawRect(0, 0, width, height)

    this.cacheAsBitmap = false
    this.visible = false

    this.addChild(new Graphics(), new Graphics())
    this.mask = this.children[0]
    this.line = this.children[1]
  }

  update() {
    this.line.clear()
    this.mask.clear()

    if (this.active == null || this.parent == null) return

    const scale = 1 / this.parent.scale.y
    const { x, y, width, height, color } = this.active

    this.line
      .lineStyle(scale, ...getSelectionColors(color).mask.line)
      .beginFill(0, 0)
      .drawRect(x, y, width, height)

    const top = y + scale
    const right = x + width - 2 * scale
    const bottom = y + height - 2 * scale
    const left =  x + scale

    this.mask
      .beginFill(0xFFFFFF)
      .moveTo(0, 0)
      .lineTo(this.width, 0)
      .lineTo(this.width, this.height)
      .lineTo(0, this.height)
      .moveTo(left, top)
      .lineTo(right, top)
      .lineTo(right, bottom)
      .lineTo(left, bottom)
      .addHole()
  }


  sync({ selection }) {
    this.active = selection
    this.mask.clear()
    this.visible = (selection != null)
  }
}


module.exports = {
  Selection,
  SelectionLayer,
  SelectionOverlay
}
