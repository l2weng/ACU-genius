'use strict'

const React = require('react')
const { Component } = React
const { connect } = require('react-redux')
const _ = require('underscore')
const { ipcRenderer: ipc } = require('electron')
const { USER } = require('../../constants')
const { Button, Menu, Icon, Dropdown, Avatar, Badge, message } = require('antd')
const { FormattedMessage } = require('react-intl')
const { MessageBox } = require('./MessageBox')
const { getUrlFilterParams } = require('../../common/dataUtil')
const { userInfo } = ARGS
const axios = require('axios')

const {
  shape, string, bool
} = require('prop-types')

class UserInfoContainer extends Component {

  static propTypes = {
    project: shape({
      file: string,
    }).isRequired,
    hasMsg: bool,
  }
  static defaultProps = {
    hasMsg: false
  }

  constructor(props) {
    super(props)
    this.state = { messages: [], messageModalVisible: false }
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
          <FormattedMessage id="header.title.signOut"/>
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
    return _.isEmpty(user) ? this.renderLogButton() : this.renderMenu(menu, user)
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
            backgroundColor: user.avatarColor || '#1890ff'
          }}
          alt="avatar">{user.name.charAt(0).toUpperCase()}</Avatar>
        <span>{user.name}</span>
      </span>
    </Dropdown>)
  }

  handleMessageModalVisible = flag => {
    let self = this
    let query = getUrlFilterParams({ userId: userInfo.user.userId }, ['userId'])

    axios.get(`${ARGS.apiServer}/graphql?query={ messageQuery${query} { messageId title content type status result createdBy createdByName invited } } `)
    .then(function (response) {
      if (response.status === 200) {
        self.setState({ messages: response.data.data.messageQuery })
      }
    })
    .catch(function () {
      message.error(self.props.intl.formatMessage({ id: 'common.error' }))
    })
    this.setState({ messageModalVisible: !!flag })
  }

  render() {
    const parentMethods = {
      handleModalVisible: this.handleMessageModalVisible,
    }
    const {messageModalVisible, messages} = this.state
    return (
      <div style={{ paddingRight: '12px' }} >
        <Badge dot={this.props.hasMsg}>
          <Button icon="mail" size="small" onClick={()=>this.handleMessageModalVisible(true)}/>
        </Badge>
        {this.renderUserInfo()}
        <MessageBox {...parentMethods} modalVisible={messageModalVisible} messages={messages}/>
      </div>
    )
  }
}

module.exports = {
  UserInfoContainer: connect(
    state => ({
      project: state.project,
    }),
  )(UserInfoContainer),
}
