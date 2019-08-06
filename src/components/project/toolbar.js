'use strict'

const React = require('react')
const { PureComponent } = React
const { FormattedMessage } = require('react-intl')
const { bool, func, number, string, object } = require('prop-types')
const { Toolbar } = require('../toolbar')
const { IconPlus, IconList, IconGrid } = require('../icons')
const { Slider } = require('../slider')
const { Button: Abutton, Popconfirm } = require('antd')
const { SearchField } = require('../search')
const { Button } = require('../button')
const { empty } = require('../../common/util')
const { LIST } = require('../../constants')


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
      isDisplay,
      isOwner,
      list,
      lists
    } = this.props
    let taskWorkStatus = 999
    if (!empty(lists) && list) {
      taskWorkStatus = lists[list].workStatus
    }

    return (
      <Toolbar isDraggable={isDraggable} onDoubleClick={onDoubleClick}>
        {isDisplay ?
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
            {isOwner ? <div className="tool-group">
              <Button
                icon={<IconPlus/>}
                isDisabled={isDisabled || !canCreateItems}
                title="toolbar.import"
                onClick={this.props.onItemCreate}/>
            </div> : ''}
            {/*<div className="tool-group">*/}
            {/*  <Button*/}
            {/*    icon={<IconPhotoResources/>}*/}
            {/*    isDisabled={isDisabled || !canCreateItems}*/}
            {/*    title="toolbar.import"*/}
            {/*    onClick={this.props.onDataSetsCreate}/>*/}
            {/*</div>*/}
            {/*<div className="tool-group">*/}
            {/*  <Button*/}
            {/*    icon={<IconExport/>}*/}
            {/*    isDisabled={isDisabled || !canCreateItems}*/}
            {/*    title="toolbar.import"*/}
            {/*    onClick={this.props.onItemCreate}/>*/}
            {/*</div>*/}
          </div> : ''}
        <div className="toolbar-center">
          <div className="item-count">
            <FormattedMessage id="toolbar.items" values={{ count: items }}/>
          </div>
        </div>
        <div className="toolbar-right">
          <div className="tool-group">
            {!isOwner ? <Popconfirm placement="right" title="Confirm" onConfirm={()=>this.props.onSubmitTask(list)} okText="Yes" cancelText="No">
              {list && taskWorkStatus !== 2 ? <Abutton icon="play-circle" size="small" style={{ marginRight: 8, height: '28px' }}>{taskWorkStatus === 0 ? 'Start Labelling' : 'Submit Task'}</Abutton> : ''}
            </Popconfirm> : ''}
          </div>
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
    list: number,
    lists: object.isRequired,
    onDoubleClick: func,
    onItemCreate: func.isRequired,
    onDataSetsCreate: func.isRequired,
    onSearch: func.isRequired,
    onZoomChange: func.isRequired,
    isDisplay: bool,
    isOwner: bool,
    onSubmitTask: func.isRequired
  }

  static defaultProps = {
    isDraggable: ARGS.frameless
  }
}


module.exports = {
  ProjectToolbar
}
