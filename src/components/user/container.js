'use strict'

const React = require('react')
const { Component } = React
const { connect } = require('react-redux')
const _ = require('underscore')
const { ipcRenderer: ipc } = require('electron')
const { USER } = require('../../constants')
const { Button, Menu, Icon, Dropdown, Avatar, Badge, message } = require('antd')
const { FormattedMessage } = require('react-intl')
const { MessageBox } = require('./messageBox')
const { getUrlFilterParams } = require('../../common/dataUtil')
const { userInfo } = ARGS
const { intlShape, injectIntl } = require('react-intl')
const axios = require('axios')

const {
  shape, string, bool, func
} = require('prop-types')

class UserInfoContainer extends Component {

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

  handleInvitation = (result, messageId, createdBy, userId) =>{
    let self = this
    axios.post(`${ARGS.apiServer}/messages/updateInvitation`, {
      result,
      messageId,
      createdBy,
      userId
    }).then(res=>{
      if (res.data.result === 'success') {
        message.success(self.props.intl.formatMessage({ id: 'common.updateSuccess' }))
        self.fitchMessages()
        self.props.fetchCoWorks()
      } else {
        message.error(self.props.intl.formatMessage({ id: 'common.error' }))
      }
    })
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
    this.fitchMessages()
    this.setState({ messageModalVisible: !!flag })
  }

  fitchMessages = () => {
    let self = this
    let query = getUrlFilterParams({ userId: userInfo.user.userId }, ['userId'])
    axios.get(
      `${ARGS.apiServer}/graphql?query={ messageQuery${query} { messageId title content type status result createdBy createdByName createdAt invited result userId} } `)
      .then(function (response) {
        if (response.status === 200) {
          self.setState({ messages: response.data.data.messageQuery })
        }
      })
      .catch(function () {
        message.error(self.props.intl.formatMessage({ id: 'common.error' }))
      })
  }

  render() {
    const parentMethods = {
      handleModalVisible: this.handleMessageModalVisible,
    }
    const { messageModalVisible, messages } = this.state
    return (
      <div style={{ paddingRight: '12px' }} >
        <Badge dot={this.props.hasMsg}>
          <Button icon="mail" size="small" onClick={()=>this.handleMessageModalVisible(true)}/>
        </Badge>
        {this.renderUserInfo()}
        <MessageBox {...parentMethods} modalVisible={messageModalVisible} messages={messages} onUpdateInvitation={this.handleInvitation}/>
      </div>
    )
  }

  static propTypes = {
    intl: intlShape.isRequired,
    project: shape({
      file: string,
    }).isRequired,
    hasMsg: bool.isRequired,
    fetchCoWorks: func.isRequired
  }
  static defaultProps = {
    hasMsg: false
  }
}

module.exports = {
  UserInfoContainer: connect(
    state => ({
      project: state.project,
    }),
  )(injectIntl(UserInfoContainer)),
}
