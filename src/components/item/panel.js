'use strict'

const React = require('react')
const { PureComponent } = React
const { ItemToolbar } = require('./toolbar')
const { PanelGroup } = require('../panel')
const { PhotoPanel } = require('../photo')
const { get } = require('../../common/util')
const { keys } = Object

const {
  array, bool, func, number, object, shape, string
} = require('prop-types')


class ItemPanel extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      hasFirstPanelFocus: false
    }
  }

  handlePhotoCreate = (dropped) => {
    this.props.onPhotoCreate({
      item: get(this.props.items, [0, 'id']),
      files: dropped && dropped.files
    })
  }

  handleResize = (slots) => {
    this.props.onUiUpdate({ panel: { slots } })
  }

  handleZoomChange = (zoom) => {
    this.props.onUiUpdate({ panel: { zoom } })
  }

  renderItemToolbar() {
    return (
      <ItemToolbar
        isItemOpen={this.props.isItemOpen}
        onMaximize={this.props.onMaximize}
        onHandleLogin={this.props.onHandleLogin}
        onModeChange={this.props.onModeChange}/>
    )
  }

  render() {
    const {
      edit,
      expanded,
      activeSelection,
      keymap,
      panel,
      photo,
      selections,
      isDisabled,
      isItemOpen,
      onItemPreview,
      onPhotoContract,
      onPhotoDelete,
      onPhotoError,
      onPhotoExpand,
      onPhotoSelect,
      onPhotoSort,
      onSelectionSort,
      ...props
    } = this.props

    const hasMultipleItems = this.props.items.length > 1
    const item = hasMultipleItems ? null : this.props.items[0]

    return (
      <PanelGroup
        slots={panel.slots}
        onResize={this.handleResize}
        header={this.renderItemToolbar()}>

        <PhotoPanel {...props}
          isDisabled={isDisabled || !item || hasMultipleItems}
          isItemOpen={isItemOpen}
          edit={edit}
          expanded={expanded}
          keymap={keymap}
          zoom={panel.zoom}
          current={photo && photo.id}
          selection={activeSelection}
          selections={selections}
          onContract={onPhotoContract}
          onCreate={this.handlePhotoCreate}
          onDelete={onPhotoDelete}
          onError={onPhotoError}
          onExpand={onPhotoExpand}
          onItemPreview={onItemPreview}
          onSelect={onPhotoSelect}
          onSort={onPhotoSort}
          onSelectionSort={onSelectionSort}
          onZoomChange={this.handleZoomChange}/>

        <PhotoPanel {...props}
          isDisabled={isDisabled || !item || hasMultipleItems}
          isItemOpen={isItemOpen}
          edit={edit}
          expanded={expanded}
          keymap={keymap}
          zoom={panel.zoom}
          current={photo && photo.id}
          selection={activeSelection}
          selections={selections}
          onContract={onPhotoContract}
          onCreate={this.handlePhotoCreate}
          onDelete={onPhotoDelete}
          onError={onPhotoError}
          onExpand={onPhotoExpand}
          onItemPreview={onItemPreview}
          onSelect={onPhotoSelect}
          onSort={onPhotoSort}
          onSelectionSort={onSelectionSort}
          onZoomChange={this.handleZoomChange}/>
      </PanelGroup>
    )
  }

  static propTypes = {
    cache: string.isRequired,
    data: object.isRequired,
    edit: object.isRequired,
    expanded: array.isRequired,
    activeSelection: number,
    keymap: object.isRequired,
    isDisabled: bool.isRequired,
    isItemOpen: bool.isRequired,
    items: array.isRequired,

    note: object,
    notes: array.isRequired,
    selections: object.isRequired,

    panel: shape({
      slots: array.isRequired,
      tab: string.isRequired,
      zoom: number.isRequired
    }).isRequired,

    photo: shape({
      id: number.isRequired
    }),
    photos: array.isRequired,
    properties: object.isRequired,

    onContextMenu: func.isRequired,
    onEdit: func.isRequired,
    onEditCancel: func,
    onItemOpen: func.isRequired,
    onItemPreview: func.isRequired,
    onItemSave: func.isRequired,
    onItemTagAdd: func.isRequired,
    onItemTagRemove: func.isRequired,
    onMaximize: func.isRequired,
    onMetadataSave: func.isRequired,
    onModeChange: func.isRequired,
    onHandleLogin: func.isRequired,
    onNoteCreate: func.isRequired,
    onNoteSelect: func.isRequired,
    onOpenInFolder: func.isRequired,
    onPhotoContract: func.isRequired,
    onPhotoCreate: func.isRequired,
    onPhotoDelete: func.isRequired,
    onPhotoError: func.isRequired,
    onPhotoExpand: func.isRequired,
    onPhotoSelect: func.isRequired,
    onPhotoSort: func.isRequired,
    onTagCreate: func.isRequired,
    onTagSave: func.isRequired,
    onSelectionSort: func.isRequired,
    onUiUpdate: func.isRequired
  }

  static props = keys(ItemPanel.propTypes)
}

module.exports = {
  ItemPanel
}
