'use strict'

const React = require('react')
const { PureComponent } = React
const { Toolbar, ToolGroup, ToolbarLeft } = require('../toolbar')
const { Button, Icon, Tooltip } = require('antd')
const ButtonGroup = Button.Group
const { func, object, array } = require('prop-types')
const { emit } = require('../../dom')
const moment = require('moment')
const __ = require('underscore')

class EsperFootToolbar extends PureComponent {

  confirmPhoto = () => {
    this.props.onLabelSave(this.props.photo)
    emit(document, 'global:next-photo')
  }

  ignorePhoto = () => {
    this.props.onLabelSkip(this.props.photo)
    emit(document, 'global:next-photo')
  }

  render() {
    const { photo, selections } = this.props
    let modifiedTime = ''
    if (photo) modifiedTime = moment(new Date(photo.modified)).format('MMM Do YYYY, h:mm:ss a')
    const photoDisable = !__.isEmpty(photo) && !photo.syncPhotoId
    const confirmButton = (<Button type="default" size="small" onClick={this.confirmPhoto} disabled={photoDisable}>
      <Icon type="save"/>
      提交
    </Button>)
    const skipButton = (<Button type="default" size="small" onClick={this.ignorePhoto}
      disabled={photoDisable}>
      跳过
    </Button>)
    return (
      <Toolbar isDraggable={false}>
        <ToolbarLeft>
          <div style={{ position: 'fixed', fontSize: '12px' }}>
            <ToolGroup>
              {(selections && selections.length > 0) ? `Date modified: ${moment(new Date(selections[selections.length - 1].updatedTime)).format('MMM Do YYYY, h:mm:ss a')}` :
              `Date modified: ${modifiedTime}`}
            </ToolGroup>
          </div>
        </ToolbarLeft>
        <div className="toolbar-center" style={{ margin: 'auto' }}>
          <ToolGroup>
            {photoDisable ? <ButtonGroup>
              <Tooltip placement="top" title={'请先同步上云'}>
                {confirmButton}
              </Tooltip>
              <Tooltip placement="top" title={'请先同步上云'}>
                {skipButton}
              </Tooltip>
            </ButtonGroup> : <ButtonGroup>{confirmButton}{skipButton}</ButtonGroup>}
          </ToolGroup>
        </div>
      </Toolbar>
    )
  }

  static propTypes = {
    photo: object,
    onLabelSave: func.isRequired,
    onLabelSkip: func.isRequired,
    selections: array.isRequired
  }
}

module.exports = {
  EsperFootToolbar
}
