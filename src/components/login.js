'use strict'

const React = require('react')
const { PureComponent, Component } = React
const { injectIntl, intlShape } = require('react-intl')
const { bool } = require('prop-types')
const { Toolbar } = require('./toolbar')
const {
  Form, Icon, Input, Button, Checkbox,
} = require('antd')
const { RegistrationForm } = require('./user/RegistrationForm')

const FormItem = Form.Item

class LoginForm extends Component {

  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values)
      }
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form
    return (
      <Form onSubmit={this.handleSubmit} className="login-form">
        <FormItem>
          {getFieldDecorator('userName', {
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
