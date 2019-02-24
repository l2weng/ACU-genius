'use strict'

const React = require('react')
const { Component } = React
const { DropTarget } = require('react-dnd')
const { NativeTypes } = require('react-dnd-electron-backend')
const { ItemGrid, ItemTable } = require('../item')
const { ProjectSidebar } = require('./sidebar')
const { ProjectToolbar } = require('./toolbar')
const { isValidImage } = require('../../image')
const { pick, } = require('../../common/util')
const { array, bool, func, object, number } = require('prop-types')
const { ITEM } = require('../../constants/sass')


class ProjectView extends Component {
  get size() {
    return ITEM.ZOOM[this.props.zoom]
  }

  get isEmpty() {
    return this.props.isEmpty &&
      !this.props.nav.trash &&
      this.props.items.length === 0
  }

  get maxZoom() {
    return ITEM.ZOOM.length - 1
  }

  get ItemIterator() {
    return this.props.zoom ? ItemGrid : ItemTable
  }

  get style() {
    return {
      flexBasis: `calc(100% - ${this.props.offset}px)`
    }
  }

  handleZoomChange = (zoom) => {
    this.props.onUiUpdate({ zoom })
  }

  handleItemImport = () => {
    return this.props.onItemImport({ list: this.props.nav.list })
  }

  handleDataSetsCreate = () => {
    return this.props.onDataSetsCreate()
  }

  handleDataSetsSync = () => {
    return this.props.onDataSetsSync()
  }

  handleSort = (sort) => {
    this.props.onSort({
      ...sort, list: this.props.nav.list || 0
    })
  }

  render() {
    const {
      isActive,
      canDrop,
      edit,
      isOver,
      items,
      keymap,
      nav,
      photos,
      tags,
      zoom,
      onMaximize,
      onItemCreate,
      onItemSelect,
      onSearch,
    } = this.props

    const { size, maxZoom, ItemIterator, isEmpty } = this

    return (
      <div id="project-view">
        <ProjectSidebar {...pick(this.props, ProjectSidebar.props)}
          isDisabled={!isActive} hasToolbar={false}/>
        <div className="main">
          <section id="items" style={this.style}>
            <header>
              <ProjectToolbar
                query={nav.query}
                zoom={zoom}
                items={items.length}
                maxZoom={maxZoom}
                canCreateItems={!nav.trash}
                isDisabled={!isActive}
                isDisplay
                onItemCreate={this.handleItemImport}
                onDataSetsCreate={this.handleDataSetsCreate}
                onDataSetsSync={this.handleDataSetsSync}
                onDoubleClick={ARGS.frameless ? onMaximize : null}
                onSearch={onSearch}
                onZoomChange={this.handleZoomChange}/>
            </header>

            <ItemIterator {...pick(this.props, ItemIterator.getPropKeys())}
              items={items}
              isEmpty={isEmpty}
              photos={photos}
              edit={edit.column}
              keymap={keymap.ItemIterator}
              list={nav.list}
              selection={nav.items}
              size={size}
              tags={tags}
              isDisabled={nav.trash}
              isOver={isOver && canDrop}
              onCreate={onItemCreate}
              onSelect={onItemSelect}
              onSort={this.handleSort}/>
            <div className="fake-gap"/>
          </section>
        </div>
      </div>
    )
  }

  static propTypes = {
    canDrop: bool,
    edit: object.isRequired,
    isActive: bool,
    isEmpty: bool.isRequired,
    isOver: bool,
    items: array.isRequired,
    keymap: object.isRequired,
    nav: object.isRequired,
    offset: number.isRequired,
    photos: object.isRequired,
    tags: object.isRequired,
    dt: func.isRequired,
    zoom: number.isRequired,
    onItemCreate: func.isRequired,
    onDataSetsCreate: func.isRequired,
    onItemImport: func.isRequired,
    onItemSelect: func.isRequired,
    onItemTagAdd: func.isRequired,
    onMaximize: func.isRequired,
    onSearch: func.isRequired,
    onSort: func.isRequired,
    onUiUpdate: func.isRequired
  }
}

const spec = {
  drop({ nav, onItemImport }, monitor) {
    const files = monitor
      .getItem()
      .files
      .filter(isValidImage)
      .map(file => file.path)

    onItemImport({ files, list: nav.list })
    return { files }
  },

  canDrop(_, monitor) {
    return !!monitor.getItem().types.find(type => isValidImage({ type }))
  }
}

const collect = (connect, monitor) => ({
  dt: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
})

module.exports = {
  ProjectView: DropTarget(NativeTypes.FILE, spec, collect)(ProjectView)
}
