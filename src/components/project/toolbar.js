'use strict'

const React = require('react')
const { PureComponent } = React
const { FormattedMessage } = require('react-intl')
const { bool, func, number, string } = require('prop-types')
const { Toolbar } = require('../toolbar')
const { IconPlus, IconList, IconGrid } = require('../icons')
const { Slider } = require('../slider')
const { SearchField } = require('../search')
const { Button } = require('../button')
const {  Tooltip, Icon } = require('antd')


class ProjectToolbar extends PureComponent {
  get isEmpty() {
    return this.props.items.length === 0
  }

  render() {
    const {
      canCreateItems,
      isDisabled,
      isDraggable,
      items,
      query,
      zoom,
      maxZoom,
      onDoubleClick,
      onSearch,
      onZoomChange,
    } = this.props

    return (
      <Toolbar isDraggable={isDraggable} onDoubleClick={onDoubleClick}>
        <div className="toolbar-left">
          <div className="tool-group">
            <Slider
              value={zoom}
              max={maxZoom}
              isDisabled={this.isEmpty || isDisabled}
              onChange={onZoomChange}
              minIcon={<IconList/>}
              maxIcon={<IconGrid/>}/>
          </div>
          <div className="tool-group">
            <Button
              icon={<IconPlus/>}
              isDisabled={isDisabled || !canCreateItems}
              title="toolbar.import"
              onClick={this.props.onItemCreate}/>
          </div>
          <div className="tool-group">
            <Tooltip placement="right" title="导入资源">
              <Icon type="picture" onClick={this.props.onDataSetsCreate} size="small"/>
            </Tooltip>
          </div>
        </div>
        <div className="toolbar-center">
          <div className="item-count">
            <FormattedMessage id="toolbar.items" values={{ count: items }}/>
          </div>
        </div>
        <div className="toolbar-right">
          <SearchField
            query={query}
            isDisabled={isDisabled}
            onSearch={onSearch}/>
        </div>
      </Toolbar>
    )
  }

  static propTypes = {
    canCreateItems: bool,
    isDraggable: bool,
    isDisabled: bool,
    items: number.isRequired,
    query: string.isRequired,
    maxZoom: number.isRequired,
    zoom: number.isRequired,
    onDoubleClick: func,
    onItemCreate: func.isRequired,
    onDataSetsCreate: func.isRequired,
    onSearch: func.isRequired,
    onZoomChange: func.isRequired
  }

  static defaultProps = {
    isDraggable: ARGS.frameless
  }
}


module.exports = {
  ProjectToolbar
}
