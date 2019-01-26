'use strict'

const React = require('react')
const { Component } = React
const { connect } = require('react-redux')
const { ipcRenderer: ipc } = require('electron')
const { USER } = require('../../constants')
const { Button } = require('antd')

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

  renderUserInfo() {
    let { project } = this.props
    if (project.hasOwnProperty('user')) {
      return <div>{project.user}</div>
    }
    if (ARGS.userInfo) {
      return <div>{ARGS.userInfo.user.name}</div>
    } else {
      return (<Button icon="user" size="small"
        onClick={() => { ipc.send(USER.LOGIN) }}>用户</Button>)
    }
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
