'use strict'

const React = require('react')
const { Button } = require('../button')
const { Editable } = require('../editable')
const { Collapse } = require('../fx')
const { IconTask, IconTriangle } = require('../icons')
const { DragSource, DropTarget } = require('react-dnd')
const { NativeTypes, getEmptyImage } = require('react-dnd-electron-backend')
const { DND, LIST, SASS, SIDEBAR } = require('../../constants')
const { bounds } = require('../../dom')
const { isValidImage } = require('../../image')
const lazy = require('./tree')
const cx = require('classnames')
const { last, noop, restrict } = require('../../common/util')
const { getTaskStatusBadge, getTaskStatusTooltip } = require('../../common/dataUtil')
const { Tooltip, Icon, Avatar, Badge } = require('antd')

const {
  arrayOf, bool, func, number, object, shape, string, array
} = require('prop-types')

const { INDENT, PADDING } = SASS.LIST

class NewListNode extends React.Component {
  handleChange = (name) => {
    this.props.onSave({ parent: this.props.parent, name })
  }

  render() {
    return (
      <li className="list-node">
        <div className="list new-list list-node-container">
          <div className="icon-truncate">
            <IconTask/>
          </div>
          <div className="name">
            <Editable
              isActive
              isRequired
              resize
              value={this.props.name}
              onCancel={this.props.onCancel}
              onChange={this.handleChange}/>
          </div>
        </div>
      </li>
    )
  }

  static propTypes = {
    parent: number.isRequired,
    name: string.isRequired,
    onCancel: func.isRequired,
    onSave: func.isRequired
  }

  static defaultProps = {
    name: '',
    parent: LIST.ROOT
  }
}


class ListNode extends React.PureComponent {
  state = {
    depth: null,
    offset: null,
    modalVisible: false,
    loading: false,
    colleagues: []
  }

  componentDidMount() {
    this.props.connectDragPreview(getEmptyImage())
  }

  componentWillMount() {
    this.isHalloween = this.props.isHalloween &&
      Math.round(Math.random() * this.props.depth) > (this.props.depth * 0.666)
  }

  get classes() {
    return ['list-node', {
      active: this.props.isSelected,
      dragging: this.props.isDragging,
      expandable: this.props.isExpandable,
      expanded: this.props.isExpanded,
      holding: this.props.isHolding
    }]
  }

  get direction() {
    let { props, state } = this
    return (!props.isOver || state.offset == null) ?  null :
      (state.offset < 1) ? 'before' :
      (props.isLast && !props.isExpanded && state.depth < props.depth) ?
        ['after', `depth-${props.depth - this.getDropDepth()}`] : 'after'
  }

  get icon() {
    return (this.props.depth > 0 && this.isHalloween) ?
      <IconTask/> : <IconTask/>
  }

  get isOver() {
    return this.props.isOver && this.props.canDrop
  }

  get isDragSource() {
    return !this.props.isEditing
  }

  get isDropTarget() {
    return !(this.props.isDragging || this.props.isDraggingParent)
  }

  getDropDepth(depth = this.state.depth) {
    return restrict(depth, this.props.minDropDepth, this.props.depth)
  }

  getDropOutsidePosition(depth = 1, other) {
    let { lists, list } = this.props
    let prev

    for (; depth > 0 && list.parent != null; --depth) {
      prev = list.id
      list = lists[list.parent]
      if (last(list.children) !== prev) break
    }

    let idx = (prev == null) ?
      list.children.length :
      list.children.indexOf(prev) + 1

    let pos = list.children.indexOf(other.id)
    if (pos >= 0 && pos < idx) idx--

    return { parent: list.id, idx }
  }

  getDropPosition(other) {
    let { offset } = this.state
    let { list, isExpanded, isLast, position } = this.props

    if (offset == null || offset === 1 && isExpanded) {
      return {
        parent: list.id,
        idx: 0
      }
    }

    let depth = this.getDropDepth()
    if (isLast && offset === 1 && depth < this.props.depth) {
      return this.getDropOutsidePosition(1 + this.props.depth - depth, other)
    }

    return {
      parent: list.parent,
      idx: (list.parent !== other.parent || position < other.idx) ?
        position + offset :
        position - 1 + offset
    }
  }

  isChildNodeSelected() {
    let { list, lists, selection, isSelected } = this.props
    if (!selection || isSelected) return false
    let p = lists[selection].parent
    while (p && p !== list.id) p = lists[p].parent
    return p === list.id
  }

  handleChange = (name) => {
    this.props.onSave({ id: this.props.list.id, name })
  }

  handleClick = () => {
    if (!this.props.isEditing) {
      this.props.onClick(this.props.list)
    }
  }

  handleContextMenu = (event) => {
    if (!this.props.isEditing) {
      if (!this.props.isSelected) {
        this.props.onClick(this.props.list)
      }

      this.props.onContextMenu(event, 'list', this.props.list)
    }
  }

  setContainer = (container) => {
    this.container = container
  }

  connect(element) {
    if (this.isDragSource) {
      element = this.props.connectDragSource(element)
    }
    if (this.isDropTarget) {
      element = this.props.connectDropTarget(element)
    }
    return element
  }

  handleExpandButtonClick = (event) => {
    event.stopPropagation()
    if (this.props.isExpanded) this.collapse()
    else this.expand()

  }
  collapse = () => {
    this.props.onCollapse(this.props.list.id, {
      select: this.isChildNodeSelected()
    })
  }

  renderAssign = (list) =>{
    const workers = list.workers
    let workerArray = []
    let workerView = ''
    if (workers) {
      workerArray = JSON.parse(workers)
      workerView = (
        <span style={{ float: 'right', cursor: 'pointer' }} onClick={() => this.props.onAddWorkers(SIDEBAR.TASK, list.syncTaskId, list.id, workerArray.map(worker=>worker.userId))}>
          <div className="antd-pro-avatar-list-avatarList">
            <ul>
              {workerArray.map((worker, idx) => {
                if (idx < 3) {
                  return <li key={idx} className="antd-pro-avatar-list-avatarItem antd-pro-avatar-list-avatarItemMini"><Tooltip placement="top" title={worker.name}><Avatar size={20} key={idx} style={{ backgroundColor: worker.avatarColor }}>{worker.name.charAt(0).toUpperCase()}</Avatar></Tooltip></li>
                }
              })}
              {workerArray.length > 3 ?
                <li className="antd-pro-avatar-list-avatarItem antd-pro-avatar-list-avatarItemMini"><Avatar size={20} key={workerArray.length} style={{ backgroundColor: '#8DA7D6' }}>+{workerArray.length - 3}</Avatar></li> : ''}
            </ul></div>
        </span>)
    }
    return (
      <div className="functionIcon">
        {workerView === '' ? <span className="functionIcon"><Tooltip placement="right" title="分配人员">
          <Icon type="user-add" size="small" onClick={() => this.props.onAddWorkers(SIDEBAR.TASK, list.syncTaskId, list.id)}/>
        </Tooltip>
        </span> : ''}
        {workerView}
      </div>)
  }

  renderTaskSubmit = (list) =>{
    return (
      <div>
        <span>
          <Tooltip placement="right" title={getTaskStatusTooltip(list.workStatus)}>
            <Badge status={getTaskStatusBadge(list.workStatus)} />
          </Tooltip>
        </span>
      </div>)
  }

  expand = () => {
    this.props.onExpand(this.props.list.id)
  }

  renderNodeContainer() {
    return this.connect(
      <div
        className={cx('list-node-container', this.direction, {
          over: this.isOver
        })}
        ref={this.setContainer}
        onContextMenu={this.handleContextMenu}
        onClick={this.handleClick}>
        {this.props.isExpandable &&
          <Button
            icon={<IconTriangle/>}
            noFocus
            onClick={this.handleExpandButtonClick}/>}
        <div className="icon-truncate">{this.icon}</div>
        <div className="name">
          <Editable
            isActive={this.props.isEditing}
            isRequired
            resize
            value={this.props.list.name}
            onCancel={this.props.onEditCancel}
            onChange={this.handleChange}/>
        </div>
        {this.props.isOwner ? this.renderAssign(this.props.list) : ''}
        {this.renderTaskSubmit(this.props.list)}
      </div>
    )
  }

  render() {
    return (
      <li className={cx(...this.classes)}>
        {this.renderNodeContainer()}
        <Collapse in={this.props.isExpanded}>
          <lazy.ListTree {...this.props}
            depth={1 + this.props.depth}
            minDropDepth={this.props.isLast ?
                this.props.minDropDepth : this.props.depth}
            isDraggingParent={
              this.props.isDraggingParent || this.props.isDragging}
            parent={this.props.list}/>
        </Collapse>
      </li>
    )
  }

  static propTypes = {
    canDrop: bool,
    isOwner: bool.isRequired,
    depth: number.isRequired,

    expand: object.isRequired,
    project: object,
    isDragging: bool,
    isDraggingParent: bool,
    isEditing: bool,
    isExpandable: bool,
    isExpanded: bool,
    isHalloween: bool,
    isHolding: bool,
    isLast: bool,
    isOver: bool,
    isSelected: bool,
    list: shape({
      id: number.isRequired,
      parent: number.isRequired,
      name: string.isRequired,
      children: arrayOf(number).isRequired
    }).isRequired,
    minDropDepth: number.isRequired,
    position: number.isRequired,

    connectDragSource: func.isRequired,
    connectDragPreview: func.isRequired,
    connectDropTarget: func.isRequired,
    onCollapse: func.isRequired,
    onExpand: func.isRequired,
    onMove: func.isRequired,
    onAddWorkers: func.isRequired,
  }

  static defaultProps = {
    depth: 0,
    onClick: noop,
    position: 0,
    isHalloween: ((d) => d.getMonth() === 9 && d.getDate() === 31)(new Date())
  }
}

const DragSourceSpec = {
  beginDrag({ list, depth, position }) {
    return {
      ...list,
      idx: position,
      padding: PADDING + INDENT * depth,
      position: 'relative'
    }
  }
}

const DragSourceCollect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging()
})

const DropTargetSpec = {
  hover({ depth }, monitor, node) {
    let type = monitor.getItemType()

    switch (type) {
      case DND.LIST: {
        let { left, top, height } = bounds(node.container)
        let { x, y } = monitor.getClientOffset()
        let offset = (y - top) / height

        node.setState({
          depth: restrict(Math.round((x - left - PADDING) / INDENT), 0, depth),
          offset: offset < 0.33 ? 0 : offset > 0.67 ? 1 : null
        })
        break
      }
      default:
        if (node.state.offset != null) {
          node.setState({ detph: null, offset: null })
        }
    }
  },

  canDrop(props, monitor) {
    let type = monitor.getItemType()
    let item = monitor.getItem()

    switch (type) {
      case NativeTypes.FILE:
        return !!item.types.find(t => isValidImage({ type: t }))
      default:
        return true
    }
  },

  drop({ list, ...props }, monitor, node) {
    try {
      let type = monitor.getItemType()
      let item = monitor.getItem()

      switch (type) {
        case DND.LIST: {
          let { parent, idx } = node.getDropPosition(item)
          props.onMove({ id: item.id, parent }, { idx })
          break
        }
        case DND.ITEMS:
          props.onDropItems({
            list: list.id,
            items: item.items
          })
          break
        case NativeTypes.FILE:
          props.onDropFiles({
            list: list.id,
            files: item.files.filter(isValidImage).map(file => file.path)
          })
          break
      }
    } finally {
      node.setState({ detph: null, offset: null })
    }
  }
}

const DropTargetCollect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
})


module.exports.NewListNode = NewListNode

module.exports.ListNode =
  DragSource(DND.LIST, DragSourceSpec, DragSourceCollect)(
    DropTarget([
      DND.LIST, DND.ITEMS, NativeTypes.FILE],
        DropTargetSpec,
        DropTargetCollect)(ListNode))
