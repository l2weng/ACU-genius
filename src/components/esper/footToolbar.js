'use strict'

const React = require('react')
const { PureComponent } = React
const { Toolbar, ToolGroup } = require('../toolbar')
const { Button, Icon } = require('antd')
const ButtonGroup = Button.Group
const { func, object } = require('prop-types')
const { emit } = require('../../dom')


class EsperFootToolbar extends PureComponent {

  confirmPhoto = () => {
    this.props.onLabelSave(this.props.photo)
    emit(document, 'global:next-photo')
  }

  ignorePhoto = () => {
    emit(document, 'global:next-photo')
  }

  viewNextPhoto = () =>{
    emit(document, 'global:next-photo')
  }

  viewPrevPhoto = () =>{
    emit(document, 'global:prev-photo')
  }

  render() {
    return (
      <Toolbar isDraggable={false}>
        <div className="toolbar-center" style={{ margin: 'auto' }}>
          <ToolGroup>
            <ButtonGroup>
              <Button type="default" onClick={this.viewPrevPhoto}>
                <Icon type="left" />
                Prev
              </Button>
              <Button type="default" onClick={this.viewNextPhoto}>
                Next
                <Icon type="right" />
              </Button>
            </ButtonGroup>
          </ToolGroup>
        </div>
        {/*<div className="toolbar-right" style={{ opacity: 1 }}>*/}
        {/*  <ToolGroup>*/}
        {/*    <ButtonGroup>*/}
        {/*      <Button type="primary"  onClick={this.confirmPhoto}>*/}
        {/*      确认*/}
        {/*      </Button>*/}
        {/*      <Button type="danger" onClick={this.ignorePhoto}>*/}
        {/*      跳过*/}
        {/*      </Button>*/}
        {/*    </ButtonGroup>*/}
        {/*  </ToolGroup>*/}
        {/*</div>*/}
      </Toolbar>
    )
  }

  static propTypes = {
    photo: object,
    onLabelSave: func.isRequired,
  }
}

module.exports = {
  EsperFootToolbar
}
