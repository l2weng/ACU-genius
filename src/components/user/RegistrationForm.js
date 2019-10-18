'use strict'

const React = require('react')
const { Component } = React
const {
  Form, Input, Icon, Checkbox, Button, notification, message, Radio
} = require('antd')
const FormItem = Form.Item
const axios = require('axios')
const { machineIdSync } = require('node-machine-id')
const { func } = require('prop-types')
const { ipcRenderer: ipc  } = require('electron')
const { USER } = require('../../constants')
const { getLocalIP } = require('../../common/serviceUtil')
const { FormattedMessage, intlShape, injectIntl } = require('react-intl')

class RegistrationForm extends Component {

  state = { userType: 0 };

  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      values = { userType: this.state.userType, status: 1, machineId: machineIdSync({ original: true }), ...values }
      if (!err) {
        axios.post(`${ARGS.apiServer}/users/create`, values).then(res => {
          if (res.status === 200) {
            const key = `open${Date.now()}`
            const btn = (
              <Button type="primary" size="small" onClick={() => this.goProject(res.data.obj, notification, key)}>
                {this.props.intl.formatMessage({ id: 'common.start' })}
              </Button>
            )
            notification.open({
              message: this.props.intl.formatMessage({ id: 'registration.success' }),
              description: `${this.props.intl.formatMessage({ id: 'registration.guideBefore' })} ${values.name}. ${this.props.intl.formatMessage({ id: 'registration.guideAfter' })}`,
              icon: <Icon type="smile" style={{ color: '#108ee9' }} />,
              btn,
              key,
              placement: 'bottomRight',
              onClose: this.close,
            })
          }
        })
        .catch((err)=> {
          message.error(this.props.intl.formatMessage({ id: 'common.error' }), err)
        })
      }
    })
  }

  goProject = (userInfo, registerNotification, key) => {
    registerNotification.close(key)
    let loginData = { username: userInfo.name, password: userInfo.password }
    loginData.ip = getLocalIP()
    axios.post(`${ARGS.apiServer}/auth`, loginData)
    .then(function (response) {
      if (response.status === 200) {
        ipc.send(USER.LOGINED, { data: response.data })
      }
    })
    .catch(function (error) {
      message.warning(this.props.intl.formatMessage({ id: 'common.passwordError' }))
    })
  }

  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form
    if (value) {
      form.validateFields(['confirm'], { force: true })
    }
    callback()
  }

  onUserTypeChange = e => {
    this.setState({
      userType: e.target.value,
    })
  };

  render() {
    const { getFieldDecorator } = this.props.form

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 10 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
      },
    }
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 16,
          offset: 8,
        },
      },
    }

    return (
      <div style={{ width: '440px' }}>
        <Form onSubmit={this.handleSubmit}>
          <Form.Item label={this.props.intl.formatMessage({ id: 'registration.accountType' })}
            {...formItemLayout}>
            <Radio.Group value={this.state.userType} onChange={this.onUserTypeChange}>
              <Radio value={0}><FormattedMessage id="registration.individual"/></Radio>
              <Radio value={1}><FormattedMessage id="registration.enterprise"/></Radio>
            </Radio.Group>
          </Form.Item>
          <FormItem
            {...formItemLayout}
            label={this.props.intl.formatMessage({ id: 'registration.username.title' })}>
            {getFieldDecorator('name', {
              rules: [{ required: true, message: this.props.intl.formatMessage({ id: 'registration.username.required' }), whitespace: true }],
            })(
              <Input />
            )}
          </FormItem>
          {this.state.userType === 1 ?
            <div>
              <FormItem
                {...formItemLayout}
                label={this.props.intl.formatMessage({ id: 'registration.email.title' })}>
                {getFieldDecorator('email', {
                  rules: [{
                    type: 'email', message: this.props.intl.formatMessage({ id: 'registration.email.noValid' }),
                  }, {
                    required: true, message: this.props.intl.formatMessage({ id: 'registration.email.required' }),
                  }],
                })(
                  <Input/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label={this.props.intl.formatMessage({ id: 'registration.company.title' })}>
                <Input />
              </FormItem>
            </div> : ''}
          <FormItem
            {...formItemLayout}
            label={this.props.intl.formatMessage({ id: 'registration.password.title' })}>
            {getFieldDecorator('password', {
              rules: [{
                required: true, message: this.props.intl.formatMessage({ id: 'registration.password.required' }),
                min: 6
              }, {
                validator: this.validateToNextPassword,
              }],
            })(
              <Input.Password placeholder={this.props.intl.formatMessage({ id: 'registration.password.longLimit' })}/>
          )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={this.props.intl.formatMessage({ id: 'registration.mobile' })}>
            <Input/>
          </FormItem>
          <Form.Item {...tailFormItemLayout}>
            {getFieldDecorator('agreement', {
              valuePropName: 'checked',
              rules: [{
                required: true, message: this.props.intl.formatMessage({ id: 'registration.agreementMessage' }),
              }]
            })(
              <Checkbox>
                <FormattedMessage id="registration.agreementBefore"/><a href=""> {this.props.intl.formatMessage({ id: 'registration.agreementAfter' })}</a>
              </Checkbox>,
            )}
          </Form.Item>
          <FormItem {...tailFormItemLayout}>
            <Button type="primary" htmlType="submit"><FormattedMessage id="registration.title"/></Button>
            <Button style={{ marginLeft: 8 }} onClick={this.props.needLogin}>
              <FormattedMessage id="registration.back"/>
            </Button>
          </FormItem>
        </Form>
      </div>
    )
  }

  static propTypes = {
    intl: intlShape.isRequired,
    needLogin: func.isRequired
  }
}

module.exports = {
  RegistrationForm: injectIntl(RegistrationForm)
}
