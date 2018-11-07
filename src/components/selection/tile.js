'use strict'

const React = require('react')
const { SelectionIterable } = require('./iterable')
const cx = require('classnames')
const { createClickHandler } = require('../util')


class SelectionTile extends SelectionIterable {
  get classes() {
    return {
      ...super.classes,
      tile: true
    }
  }

  handleClick = createClickHandler({
    onClick: this.select,
    onDoubleClick: this.open
  })


  render() {
    return this.connect(
      <li
        className={cx(this.classes)}
        ref={this.setContainer}
        onContextMenu={this.handleContextMenu}
        onClick={this.handleClick}>
        <div className="tile-state">
          {this.renderThumbnail()}
        </div>
      </li>
    )
  }

  static defaultProps = {
    ...SelectionIterable.defaultProps,
    size: 512
  }
}

module.exports = {
  SelectionTile: SelectionTile.withDragAndDrop()
}
