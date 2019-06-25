'use strict'

const React = require('react')
const { PureComponent } = React
const PropTypes = require('prop-types')
const { arrayOf, bool, number, string, shape, object, func } = PropTypes
const { Tag } = require('./tag')
const { get, noop } = require('../../common/util')
const { match } = require('../../keymap')
const __ = require('underscore')


class PanelTagList extends PureComponent {

  constructor(props) {
    super(props)

    this.state = {
      activeTag: 0
    }
  }

  isEditing(tag) {
    return get(this.props.edit, ['id']) === tag.id
  }

  isSelected(tag) {
    return this.props.selection.includes(tag.id)
  }

  handleSelect = (tag)=>{
    this.props.onTagSelect(tag)
  }

  handleContextMenu = (event, tag) => {
    const { selection, onSelect, onContextMenu } = this.props

    if (!this.isSelected(tag) || selection.length > 1) {
      onSelect(tag.id, { mod: 'replace' })
    }

    onContextMenu(event, tag)
  }

  handleKeyDown = (event) => {
    event.preventDefault()
    event.stopPropagation()
    event.nativeEvent.stopImmediatePropagation()
  }

  render() {
    const {
      hasFocusIcon,
      hasShapeIcon,
      onCommit,
      onDropItems,
      onEditCancel,
      tags,
      activeTag,
      onSave
    } = this.props
    if (tags.length !== 0 && activeTag === 0) {
      tags[0].selected = true
    } else {
      for (const tag of tags) {
        tag.selected = tag.id === activeTag
      }
    }
    return (
      <ol className="tag-list">
        {tags.map(tag =>
          <Tag
            isSelected={tag.selected}
            key={`${tag.id}-${tag.selected}`}
            tag={tag}
            hasShapeIcon={hasShapeIcon}
            hasFocusIcon={hasFocusIcon}
            isEditing={this.isEditing(tag)}
            onChange={onSave}
            onDropItems={onDropItems}
            onEditCancel={onEditCancel}
            onFocusClick={onCommit}
            onKeyDown={this.handleKeyDown}
            onSelect={this.handleSelect}
            onContextMenu={this.handleContextMenu}/>)}
      </ol>
    )
  }

  static propTypes = {
    tags: arrayOf(shape({
      id: number.isRequired,
      name: string.isRequired
    })).isRequired,

    hasFocusIcon: bool,
    hasShapeIcon: bool,
    activeTag: number,
    selection: arrayOf(number).isRequired,
    keymap: object.isRequired,
    edit: object,

    onCommit: func.isRequired,
    onDropItems: func,
    onEditCancel: func.isRequired,
    onRemove: func.isRequired,
    onSelect: func.isRequired,
    onSave: func.isRequired,
    onTagSelect: func.isRequired,
    onContextMenu: func.isRequired
  }

  static defaultProps = {
    selection: [],
    onCommit: noop,
    onSelect: noop
  }
}

module.exports = {
  PanelTagList
}
