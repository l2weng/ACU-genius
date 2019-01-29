'use strict'

const React = require('react')
const { PureComponent, Component } = React
const { injectIntl, intlShape } = require('react-intl')
const { message } = require('antd')
const { bool } = require('prop-types')
const { Toolbar } = require('./toolbar')
const axios = require('axios')
const {
  Form, Icon, Input, Button, Checkbox,
} = require('antd')
const { RegistrationForm } = require('./user/RegistrationForm')
const { ipcRenderer: ipc  } = require('electron')
const { USER } = require('../constants')

const FormItem = Form.Item

class LoginForm extends Component {

  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        axios.post(`${ARGS.apiServer}/auth`, values)
        .then(function (response) {
          if (response.status === 200) {
            message.success('Login Success', 1, ()=>{
              ipc.send(USER.LOGINED, { data: response.data })
            })
          }
        })
        .catch(function (error) {
          message.warning('用户名密码错误, 请重试')
        })
      }
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form
    return (
      <Form onSubmit={this.handleSubmit} className="login-form">
        <FormItem>
          {getFieldDecorator('username', {
            rules: [{ required: true, message: 'Please input your username!' }],
          })(
            <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Username" />
            )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: 'Please input your Password!' }],
          })(
            <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />
            )}
        </FormItem>
        <FormItem>

          <Checkbox>Remember me</Checkbox>

          <a className="login-form-forgot" href="">Forgot password</a>
          <Button type="primary" htmlType="submit" className="login-form-button">
              Log in
          </Button>
        </FormItem>
      </Form>
    )
  }
}

//Todo login module
class Login extends PureComponent {

  renderToolbar() {
    return this.props.showToolbar && <Toolbar/>
  }

  state = { visible: false };

  needRegister = () => {
    this.setState({
      visible: true,
    })
  };
  needLogin = () => {
    this.setState({
      visible: false,
    })
  };

  render() {
    const { visible } = this.state
    const WrappedNormalLoginForm = Form.create()(LoginForm)
    const WrappedRegistrationForm = Form.create()(RegistrationForm)
    return (
      <div className={!visible ? 'login-view' : 'register-view'}>
        {this.renderToolbar()}
        <div className="flex-row center">
          <figure className="app-icon"/>
          {!visible ? <WrappedNormalLoginForm/> : <WrappedRegistrationForm/>}
          {!visible ? <FormItem>
            <a onClick={this.needRegister}>register now!</a>
          </FormItem> : <FormItem>
            <a onClick={this.needLogin}>back!</a>
          </FormItem>}
        </div>
      </div>
    )
  }

  static propTypes = {
    intl: intlShape.isRequired,
    showToolbar: bool.isRequired
  }

  static defaultProps = {
    showToolbar: ARGS.frameless
  }
}

module.exports = {
  Login: injectIntl(Login)
}
