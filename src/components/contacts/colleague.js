'use strict'

const React = require('react')
const { PureComponent } = React
const { List, Icon,  Avatar, Card, Form, Modal, Input, message } = require('antd')
const { getUrlFilterParams } = require('../../common/dataUtil')
const { userInfo } = ARGS
const FormItem = Form.Item
const { FormattedMessage, intlShape, injectIntl } = require('react-intl')
const axios = require('axios')
const _ = require('underscore')

const IconText = ({ type, text }) => (
  <span>
    <Icon type={type} style={{ marginRight: 8 }} />
    {text}
  </span>
)

const ColleagueForm = Form.create()(props => {
  const { modalVisible, form, intl, handleAdd, handleColleagueModalVisible, confirmDirty } = props
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return
      form.resetFields()
      handleAdd(fieldsValue)
    })
  }
  const formItemLayout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  }

  const handleConfirmBlur = (e) => {
    // this.setState({ confirmDirty:confirmDirty || !!value })
  }

  const compareToFirstPassword = (rule, value, callback) => {
    if (value && value !== form.getFieldValue('password')) {
      callback('两次密码不一致!')
    } else {
      callback()
    }
  }

  const validateToNextPassword = (rule, value, callback) => {
    if (value && confirmDirty) {
      form.validateFields(['confirm'], { force: true })
    }
    callback()
  }

  return (
    <Modal
      destroyOnClose
      title={<FormattedMessage id="contacts.addColleague"/>}
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleColleagueModalVisible()}>
      <FormItem {...formItemLayout} label={<FormattedMessage id="contacts.form.name"/>}>
        {form.getFieldDecorator('name', {
          rules: [{ required: true, message: intl.formatMessage({ id: 'contacts.form.nameLengthLimit' }), min: 2 }],
        })(<Input placeholder={intl.formatMessage({ id: 'contacts.form.enterPlaceHolder' })} />)}
      </FormItem>
      <FormItem
        {...formItemLayout}
        label={<FormattedMessage id="contacts.form.mobile"/>}>
        {form.getFieldDecorator('phone')(
          <Input placeholder={intl.formatMessage({ id: 'contacts.form.enterPlaceHolder' })} />
        )}
      </FormItem>
      <FormItem
        {...formItemLayout}
        label={<FormattedMessage id="contacts.form.email"/>}>
        {form.getFieldDecorator('email', {
          rules: [{
            type: 'email', message: intl.formatMessage({ id: 'contacts.form.emailLimit' }),
          }, {
            required: true, message: intl.formatMessage({ id: 'contacts.form.emailRequired' }),
          }],
        })(
          <Input placeholder={intl.formatMessage({ id: 'contacts.form.enterPlaceHolder' })} />
        )}
      </FormItem>
      <FormItem
        {...formItemLayout}
        label={<FormattedMessage id="contacts.form.defaultPassword"/>}>
        {form.getFieldDecorator('password', {
          rules: [{
            required: true, message: intl.formatMessage({ id: 'contacts.form.passwordRequired' }),
          }, {
            validator: validateToNextPassword,
          }],
        })(
          <Input placeholder={intl.formatMessage({ id: 'contacts.form.enterPlaceHolder' })} />
        )}
      </FormItem>
    </Modal>
  )
})

const Colleague = injectIntl(class extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      colleagueList: [],
      colleagueModalVisible: false,
      confirmDirty: false,
    }
  }

  componentDidMount() {
    if (!_.isEmpty(userInfo.user)) {
      this.fetchColleagues()
    }
  }

  handleAdd = fields => {
    let self = this
    fields.ownerId = userInfo.user.userId
    fields.userType = userInfo.user.userType
    fields.status = userInfo.user.status
    fields.companyId = userInfo.user.companyId
    axios.post(`${ARGS.apiServer}/users/createAdd2Contact`, fields)
    .then(function (response) {
      if (response.status === 200) {
        self.handleColleagueModalVisible()
        message.success(self.props.intl.formatMessage({ id: 'common.addSuccess' }), 0.5)
        self.fetchColleagues()
      }
    })
    .catch(function () {
      message.warning(self.props.intl.formatMessage({ id: 'common.error' }))
    })
  }

  fetchColleagues = () => {
    let query = getUrlFilterParams({ companyId: userInfo.user.companyId }, ['companyId'])
    let self = this
    this.setState({ loading: true })
    axios.get(`${ARGS.apiServer}/graphql?query={userQueryColleagues${query} { userId name email status phone userType userTypeDesc statusDesc avatarColor }}`)
    .then(function (response) {
      if (response.status === 200) {
        self.setState({ colleagueList: response.data.data.userQueryColleagues, loading: false })
      }
    })
    .catch(function () {
      message.warning('同事不存在, 请重试')
      self.setState({ loading: false })
    })
  }

  handleColleagueModalVisible = flag => {
    this.setState({
      colleagueModalVisible: !!flag,
    })
  }

  render() {

    const { loading, colleagueModalVisible, colleagueList, confirmDirty } = this.state
    const parentMethods = {
      handleAdd: this.handleAdd,
      handleColleagueModalVisible: this.handleColleagueModalVisible,
    }
    return (
      <div>
        <Card title={<FormattedMessage id="contacts.colleague"/>} bordered={false} extra={<a href="#" onClick={() => this.handleColleagueModalVisible(true)}><FormattedMessage id="contacts.addColleague"/></a>}>
          <List
            itemLayout="vertical"
            size="large"
            loading={loading}
            grid={{ gutter: 16, column: 4 }}
            dataSource={colleagueList}
            renderItem={item => (
              <List.Item
                key={item.phone}>
                <List.Item.Meta
                  avatar={<Avatar alt="" style={{ backgroundColor: item.avatarColor || '#1890ff' }}>{item.name.charAt(0).toUpperCase()}</Avatar>}
                  title={<a href={item.href}>{item.name}</a>}
                  description={item.email}/>
              </List.Item>
          )}/>
        </Card>
        <ColleagueForm {...parentMethods} intl={this.props.intl} modalVisible={colleagueModalVisible} confirmDirty={confirmDirty}/>
      </div>
    )
  }
  static propTypes = {
    intl: intlShape.isRequired,
  }
})

module.exports = {
  Colleague,
}
