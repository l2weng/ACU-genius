'use strict'

const React = require('react')
const { Component } = React
const { connect } = require('react-redux')
const _ = require('underscore')
const { ipcRenderer: ipc } = require('electron')
const { USER } = require('../../constants')
const { Button, Menu, Icon, Dropdown, Avatar } = require('antd')

const {
  shape, string,
} = require('prop-types')

class UserInfoContainer extends Component {

  static propTypes = {
    project: shape({
      file: string,
    }).isRequired,
  }

  constructor(props) {
    super(props)

    this.state = {}
  }

  onMenuClick = ({ key }) => {
    if (key === 'userCenter') {
      return
    }
    if (key === 'userinfo') {
      return
    }
    if (key === 'logout') {
      ipc.send(USER.LOGOUT)
    }
  };

  renderUserInfo() {
    const menu = (
      <Menu className="menu" selectedKeys={[]} onClick={this.onMenuClick}>
        <Menu.Item key="logout">
          <Icon type="logout" />
          退出登录
        </Menu.Item>
      </Menu>
    )
    let { project } = this.props
    let { userInfo: { user } } = ARGS
    if (project.hasOwnProperty('user')) {
      return _.isEmpty(project.user) ? this.renderLogButton() : this.renderMenu(
        menu,
        project.user)
    }
    return user ? this.renderMenu(menu, user) : this.renderLogButton()
  }

  renderLogButton() {
    return (<Button icon="user" size="small"
      onClick={() => { ipc.send(USER.LOGIN) }}>登录</Button>)
  }

  renderMenu(menu, user) {
    return (<Dropdown overlay={menu}>
      <span className="action account">
        <Avatar
          size="small"
          className="avatar"
          src={user.avatar}
          style={{
            backgroundColor: user.avatarColor
                ? user.avatarColor
                : '#1890ff'
          }}
          alt="avatar">{user.name.charAt(0)}</Avatar>
        <span>{user.name}</span>
      </span>
    </Dropdown>)
  }

  render() {
    return (
      <div style={{ paddingRight: '12px' }} >{this.renderUserInfo()}</div>)
  }
}

module.exports = {
  UserInfoContainer: connect(
    state => ({
      project: state.project,
    }),
  )(UserInfoContainer),
}
