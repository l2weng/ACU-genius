'use strict'

const React = require('react')
const { IconFolder } = require('../icons')
const { number, shape, string } = require('prop-types')


class ListDragPreview extends React.PureComponent {
  get style() {
    return {
      paddingLeft: this.props.list.padding
    }
  }

  render() {
    return (
      <div className="list drag-preview" style={this.style}>
        <IconFolder/>
        <div className="name">
          {this.props.list.name}
        </div>
      </div>
    )
  }

  static propTypes = {
    list: shape({
      name: string.isRequired,
      padding: number.isRequired
    }).isRequired
  }
}

module.exports = {
  ListDragPreview
}
