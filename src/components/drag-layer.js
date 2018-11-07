'use strict'

const React = require('react')
const ReactDnD = require('react-dnd')
const { ItemDragPreview } = require('./item')
const { PhotoDragPreview } = require('./photo')
const { SelectionDragPreview } = require('./selection')
const { ListDragPreview } = require('./list')
const { DND } = require('../constants')
const { bool, number, object, shape, string } = require('prop-types')


class DragLayer extends React.Component {
  get position() {
    let { position, item } = this.props
    let x = 0
    let y = 0

    if (position) {
      x = position.x
      y = position.y

      switch (item.position) {
        case 'relative': {
          let { offset } = this
          x -= offset.x
          y -= offset.y
          break
        }
      }
    }

    return { x, y }
  }

  get offset() {
    let origin = this.props.initialSourceClientOffset
    let cursor = this.props.initialClientOffset

    return {
      x: cursor.x - origin.x,
      y: cursor.y - origin.y
    }
  }

  get style() {
    let { x, y } = this.position
    return {
      transform: `translate(${x}px, ${y}px)`
    }
  }

  renderItemPreview() {
    let { item, type, ...props } = this.props

    switch (type) {
      case DND.ITEMS:
        return <ItemDragPreview {...props} items={item.items}/>
      case DND.PHOTO:
        return <PhotoDragPreview {...props} items={[item]}/>
      case DND.SELECTION:
        return <SelectionDragPreview {...props} items={[item]}/>
      case DND.LIST:
        return <ListDragPreview list={item}/>
    }
  }

  render() {
    let { type, isDragging } = this.props
    let preview = isDragging && type && this.renderItemPreview()

    return (!preview) ? null : (
      <div id="project-drag-layer" className="drag-layer">
        <div className="drag-preview-positioner" style={this.style}>
          {preview}
        </div>
      </div>
    )
  }

  static propTypes = {
    cache: string.isRequired,
    isDragging: bool,
    item: object,
    position: shape({
      x: number.isRequired,
      y: number.isRequired
    }),
    start: shape({
      x: number.isRequired,
      y: number.isRequired
    }),
    tags: object.isRequired,
    type: string,
  }
}

module.exports = {
  DragLayer: ReactDnD.DragLayer((monitor) => ({
    item: monitor.getItem(),
    type: monitor.getItemType(),
    initialClientOffset: monitor.getInitialClientOffset(),
    initialSourceClientOffset: monitor.getInitialSourceClientOffset(),
    position: monitor.getClientOffset(),
    isDragging: monitor.isDragging()
  }))(DragLayer)
}
