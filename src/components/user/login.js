'use strict'

const React = require('react')
const { PureComponent, Component } = React
const { injectIntl, intlShape, FormattedMessage } = require('react-intl')
const { message } = require('antd')
const { bool } = require('prop-types')
const { Toolbar } = require('../toolbar')
const axios = require('axios')
const {
  Form, Icon, Input, Button,
} = require('antd')
const { RegistrationForm } = require('./RegistrationForm')
const { ipcRenderer: ipc, shell } = require('electron')
const { USER } = require('../../constants')
const { getLocalIP } = require('../../common/serviceUtil')


const FormItem = Form.Item

class LoginForm extends Component {

  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values.ip = getLocalIP()
        axios.post(`${ARGS.apiServer}/auth`, values)
        .then(function (response) {
          if (response.status === 200) {
            message.success('Login Success', 0.5, ()=>{
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
    const { intl } = this.props
    return (
      <Form onSubmit={this.handleSubmit} className="login-form">
        <FormItem>
          {getFieldDecorator('username', {
            rules: [{ required: true, message: this.props.intl.formatMessage({ id: 'registration.username.required' }) }],
          })(
            <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder={intl.formatMessage({ id: 'login.username' })} />
            )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: this.props.intl.formatMessage({ id: 'registration.password.required' }) }],
          })(
            <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder={intl.formatMessage({ id: 'login.password' })} />
            )}
        </FormItem>
        <FormItem>
          {/*<Checkbox>Remember me</Checkbox>*/}
          <a className="login-form-forgot" onClick={() => shell.openExternal(this.props.intl.formatMessage({ id: 'registration.password.forgot' }))}>{intl.formatMessage({ id: 'login.forgotPassword' })}?</a>
          <Button type="primary" htmlType="submit" className="login-form-button">
            <FormattedMessage id={'login.title'}/>
          </Button>
        </FormItem>
      </Form>
    )
  }

  static propTypes = {
    intl: intlShape.isRequired,
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
          {!visible ? <WrappedNormalLoginForm intl={this.props.intl}/> : <WrappedRegistrationForm needLogin={this.needLogin}/>}
          {!visible ? <FormItem>
            <a onClick={this.needRegister}>{this.props.intl.formatMessage({ id: 'login.registerNow' })}!</a>
          </FormItem> : ''}
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
