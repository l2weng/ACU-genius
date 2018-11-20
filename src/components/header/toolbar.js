'use strict'

const React = require('react')
const { PureComponent } = React
const { bool, func, number } = require('prop-types')
const { Toolbar } = require('../toolbar')
const { Button: ButtonAnt } = require('antd')


class HeaderToolbar extends PureComponent {

  render() {
    const {
      isDraggable,
      onDoubleClick,
    } = this.props

    return (
      <Toolbar isDraggable={isDraggable} onDoubleClick={onDoubleClick}>
        <div className="toolbar-left" />
        <div className="toolbar-center">
          <div className="tool-group">
            <ButtonAnt icon="car" size="small">首页</ButtonAnt>
          </div>
          <div className="tool-group">
            <ButtonAnt icon="project" size="small">项目</ButtonAnt>
          </div>
          <div className="tool-group">
            <ButtonAnt icon="contacts" size="small">联系人</ButtonAnt>
          </div>
        </div>
        <div className="toolbar-right">
          <div className="tool-group">
            <ButtonAnt icon="user" size="small">用户</ButtonAnt>
          </div>
        </div>
      </Toolbar>
    )
  }

  static propTypes = {
    isDraggable: bool,
    isDisabled: bool,
    zoom: number.isRequired,
    onDoubleClick: func
  }

  static defaultProps = {
    isDraggable: ARGS.frameless
  }
}


module.exports = {
  HeaderToolbar
}
