'use strict'

const React = require('react')
const { PureComponent } = React
const PropTypes = require('prop-types')
const { arrayOf, bool, number, string, shape, object, func } = PropTypes
const { Tag } = require('./tag')
const { get, noop } = require('../../common/util')
const { match } = require('../../keymap')


class PanelTagList extends PureComponent {

  constructor(props) {
    super(props)

    this.state = {
      itemTags: this.props.tags
    }
  }

  isEditing(tag) {
    return get(this.props.edit, ['id']) === tag.id
  }

  isSelected(tag) {
    return this.props.selection.includes(tag.id)
  }


  handleContextMenu = (event, tag) => {
    const { selection, onSelect, onContextMenu } = this.props

    if (!this.isSelected(tag) || selection.length > 1) {
      onSelect(tag.id, { mod: 'replace' })
    }

    onContextMenu(event, tag)
  }

  handleKeyDown = (event, tag) => {
    switch (match(this.props.keymap, event)) {
      case 'remove':
        this.props.onRemove(tag)
        break
      case 'commit':
        this.props.onCommit(tag)
        break
      case 'clear':
        this.props.onSelect(tag.id, { mod: 'clear' })
        break
      default:
        return
    }

    event.preventDefault()
    event.stopPropagation()
    event.nativeEvent.stopImmediatePropagation()
  }

  handleFocusClick = (tag) => {
    console.log(tag)
  }


  componentWillReceiveProps(props) {
    if (this.state.itemTags !== props.tags) {
      this.setState({ itemTags: props.tags })
    }
  }

  render() {
    const {
      hasFocusIcon,
      hasShapeIcon,
      onDropItems,
      onEditCancel,
      onSelect,
      onSave
    } = this.props
    const { itemTags } = this.state
    if (itemTags.filter(iTag => iTag.selected === true).length === 0) {
      itemTags[0].selected = true
    }
    return (
      <ol className="tag-list">
        {itemTags.map(tag =>
          <Tag
            isSelected={tag.selected}
            key={tag.id}
            tag={tag}
            hasShapeIcon={hasShapeIcon}
            hasFocusIcon={hasFocusIcon}
            isEditing={this.isEditing(tag)}
            onChange={onSave}
            onDropItems={onDropItems}
            onEditCancel={onEditCancel}
            onFocusClick={this.handleFocusClick}
            onKeyDown={this.handleKeyDown}
            onSelect={onSelect}
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
    selection: arrayOf(number).isRequired,
    keymap: object.isRequired,
    edit: object,

    onCommit: func.isRequired,
    onDropItems: func,
    onEditCancel: func.isRequired,
    onRemove: func.isRequired,
    onSelect: func.isRequired,
    onSave: func.isRequired,
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
