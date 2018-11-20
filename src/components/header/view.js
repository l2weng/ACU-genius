'use strict'

const React = require('react')
const { Component } = React
const { ItemGrid, ItemTable } = require('../item')
const { HeaderToolbar } = require('./toolbar')
const { bool, func, object, number } = require('prop-types')
const { ITEM } = require('../../constants/sass')


class HeaderView extends Component {
  get size() {
    return ITEM.ZOOM[this.props.zoom]
  }

  get ItemIterator() {
    return this.props.zoom ? ItemGrid : ItemTable
  }

  get style() {
    return {
      flexBasis: '100%',
      borderBottom: '1px solid #dbdbdb'
    }
  }

  handleZoomChange = (zoom) => {
    this.props.onUiUpdate({ zoom })
  }

  render() {
    const {
      isActive,
      zoom,
      onMaximize,
    } = this.props


    return (
      <div>
        <div className="main">
          <section style={this.style}>
            <header>
              <HeaderToolbar
                zoom={zoom}
                isDisabled={!isActive}
                onDoubleClick={ARGS.frameless ? onMaximize : null}
                onZoomChange={this.handleZoomChange}/>
            </header>

            <div className="fake-gap"/>
          </section>
        </div>
      </div>
    )
  }

  static propTypes = {
    isActive: bool,
    offset: number.isRequired,
    zoom: number.isRequired,
    onMaximize: func.isRequired,
    onUiUpdate: func.isRequired
  }
}

module.exports = {
  HeaderView
}
