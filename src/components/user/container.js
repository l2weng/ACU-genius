'use strict'

const React = require('react')
const { Component } = React
const { connect } = require('react-redux')
const { ipcRenderer: ipc  } = require('electron')
const { USER } = require('../../constants')
const { Button } = require('antd')


const {
  shape, string
} = require('prop-types')


class UserInfoContainer extends Component {
  constructor(props) {
    super(props)

    this.state = {
    }
  }

  render() {
    let { project } = this.props
    return (<div style={{ paddingRight: '12px' }}>{!project.hasOwnProperty('user') ? <Button icon="user" size="small" onClick={()=>{ ipc.send(USER.LOGIN) }}>用户</Button> : project.user}</div>)
  }


  static propTypes = {
    project: shape({
      file: string
    }).isRequired,
  }
}

module.exports = {
  UserInfoContainer: connect(
    state => ({
      project: state.project,
    }),
  )(UserInfoContainer)
}
