'use strict'

const React = require('react')
const { DropTarget } = require('react-dnd')
const { ipcRenderer: ipc  } = require('electron')
const { NativeTypes } = require('react-dnd-electron-backend')
const { IconMaze, IconSync } = require('../icons')
const { Editable } = require('../editable')
const { isValidImage } = require('../../image')
const cx = require('classnames')
const { bool, func, string, number } = require('prop-types')
const {  Tooltip, Icon, message } = require('antd')

class ProjectName extends React.PureComponent {
  get classes() {
    return {
      'project-name': true,
      'active': this.props.isSelected,
      'over': this.props.isOver && this.props.canDrop
    }
  }

  handleSync2Cloud = ()=>{
    ipc.send('cmd', 'app:sync-whole-project')
  }

  handleSyncProject = ()=>{
    if (this.props.isOwner) {
      this.props.onSyncProjectData()
    } else {
      console.log('reload windows')
      ipc.send('win-reload')
    }
  }

  // componentWillReceiveProps(props) {
  //   if (this.props.synced !== undefined && (this.props.synced !== props.synced) &&
  //     (props.synced === 1)) {
  //     message.success('Sync successfully', 0.5)
  //   }
  // }

  render() {
    return this.props.dt(
      <li className={cx(this.classes)}>
        <div className="list-node-container">
          <IconMaze/>
          <div className="name" onClick={this.props.onClick}>
            <Editable
              value={this.props.name}
              isRequired
              resize
              isActive={this.props.isEditing}
              onCancel={this.props.onEditCancel}
              onChange={this.props.onChange}/>
          </div>
          {this.props.isOwner ? <div>
            <span className="functionIcon" style={{ fontSize: '20px' }} onClick={this.handleSync2Cloud}><Tooltip placement="right" title="同步到云">
              <Icon type="cloud" theme="twoTone" twoToneColor={this.props.synced === 1 ? '#8da7d3' : '#e96529'} />
            </Tooltip>
            </span>
          </div> : ''}
          <div>
            <Tooltip placement="right" title="刷新">
              <span onClick={this.handleSyncProject} className="functionIcon" style={{ width: '20px' }}>
                <IconSync/>
              </span>
            </Tooltip>
          </div>
          {/*<span className="functionIcon"><Tooltip placement="right" title="项目详情">*/}
          {/*  <Icon type="info-circle"/>*/}
          {/*</Tooltip>*/}
          {/*</span>*/}
        </div>
      </li>
    )
  }


  static propTypes = {
    name: string.isRequired,
    projectId: string.isRequired,
    isOwner: bool.isRequired,
    isEditing: bool,
    isSelected: bool,
    isOver: bool,
    canDrop: bool,
    dt: func.isRequired,
    onClick: func.isRequired,
    onEditCancel: func.isRequired,
    onChange: func.isRequired,
    onDrop: func.isRequired,
    onSyncProject2Cloud: func.isRequired,
    onSyncProjectData: func.isRequired,
    synced: number,
  }
}

const spec = {
  drop({ onDrop }, monitor) {
    const { files } = monitor.getItem()

    const images = files
      .filter(isValidImage)
      .map(file => file.path)

    return onDrop({ files: images }), { images }
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
  ProjectName: DropTarget(
    NativeTypes.FILE, spec, collect
  )(ProjectName)
}
