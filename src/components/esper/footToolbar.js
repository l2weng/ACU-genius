'use strict'

const React = require('react')
const { PureComponent } = React
const { Toolbar, ToolGroup, ToolbarLeft } = require('../toolbar')
const { Button, Icon, Tooltip } = require('antd')
const ButtonGroup = Button.Group
const { func, object, array } = require('prop-types')
const { emit } = require('../../dom')
const moment = require('moment')


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
    if (photo) modifiedTime = moment(new Date(photo.modified)).format('MMMM Do YYYY, h:mm:ss a')
    return (
      <Toolbar isDraggable={false}>
        <ToolbarLeft>
          <ToolGroup>
            {(selections && selections.length > 0) ? `Date modified:${moment(new Date(selections[0].updatedTime)).format('MMMM Do YYYY, h:mm:ss a')}` :
              `Date modified:${modifiedTime}`}
          </ToolGroup>
        </ToolbarLeft>
        <div className="toolbar-center" style={{ margin: 'auto' }}>
          <ToolGroup>
            {(photo && photo.syncPhotoId) ?
              <ButtonGroup>
                <Button type="default" size="small" onClick={this.confirmPhoto}>
                  <Icon type="save"/>
                  提交
                </Button>
                <Button type="default" size="small" onClick={this.ignorePhoto}>
                  跳过
                </Button>
              </ButtonGroup> :
              <Tooltip placement="top" title={'请先同步项目'}>
                <ButtonGroup>
                  <Button type="default" size="small" onClick={this.confirmPhoto} disabled>
                    <Icon type="save"/>
                    提交
                  </Button>
                  <Button type="default" size="small" onClick={this.ignorePhoto} disabled>
                    跳过
                  </Button>
                </ButtonGroup>
              </Tooltip>
            }
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
