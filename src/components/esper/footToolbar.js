'use strict'

const React = require('react')
const { PureComponent } = React
const { Toolbar, ToolGroup } = require('../toolbar')
const { Button, Icon, Tooltip } = require('antd')
const ButtonGroup = Button.Group
const { func, object } = require('prop-types')
const { emit } = require('../../dom')


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
    const { photo } = this.props
    return (
      <Toolbar isDraggable={false}>
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
  }
}

module.exports = {
  EsperFootToolbar
}
