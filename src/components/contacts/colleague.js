'use strict'

const React = require('react')
const { PureComponent } = React
const { List, Icon,  Avatar, Card, Form, Modal, Input, message } = require('antd')
const { getUrlFilterParams } = require('../../common/dataUtil')
const { userInfo } = ARGS
const FormItem = Form.Item
const axios = require('axios')
const _ = require('underscore')

const IconText = ({ type, text }) => (
  <span>
    <Icon type={type} style={{ marginRight: 8 }} />
    {text}
  </span>
)

const ColleagueForm = Form.create()(props => {
  const { modalVisible, form, handleAdd, handleColleagueModalVisible, confirmDirty } = props
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return
      form.resetFields()
      handleAdd(fieldsValue)
    })
  }
  const formItemLayout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 15 },
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
      title="添加同事"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleColleagueModalVisible()}>
      <FormItem {...formItemLayout} label="名称">
        {form.getFieldDecorator('name', {
          rules: [{ required: true, message: '请输入至少2个字符的名称！', min: 2 }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem
        {...formItemLayout}
        label="手机号码">
        {form.getFieldDecorator('phone', { rules: [{ max: 11, message: '请输入合法手机号!' }] })(
          <Input placeholder="请输入"/>
        )}
      </FormItem>
      <FormItem
        {...formItemLayout}
        label="E-mail">
        {form.getFieldDecorator('email', {
          rules: [{
            type: 'email', message: '请输入合法 E-mail!',
          }, {
            required: true, message: '请输入 E-mail!',
          }],
        })(
          <Input placeholder="请输入"/>
        )}
      </FormItem>
      <FormItem
        {...formItemLayout}
        label="初始密码">
        {form.getFieldDecorator('password', {
          rules: [{
            required: true, message: '输入密码!',
          }, {
            validator: validateToNextPassword,
          }],
        })(
          <Input type="password" placeholder="请输入"/>
        )}
      </FormItem>
      <FormItem
        {...formItemLayout}
        label="确认密码">
        {form.getFieldDecorator('confirm', {
          rules: [{
            required: true, message: '确认密码!',
          }, {
            validator: compareToFirstPassword,
          }],
        })(
          <Input type="password" onBlur={handleConfirmBlur} placeholder="请输入"/>
        )}
      </FormItem>
    </Modal>
  )
})

class Colleague extends PureComponent {
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
        message.success('添加成功', 0.5)
        self.fetchColleagues()
      }
    })
    .catch(function () {
      message.warning('系统错误')
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
        <Card title="公司同事" bordered={false} extra={<a href="#" onClick={() => this.handleColleagueModalVisible(true)}>添加同事</a>}>
          <List
            itemLayout="vertical"
            size="large"
            loading={loading}
            grid={{ gutter: 16, column: 4 }}
            dataSource={colleagueList}
            renderItem={item => (
              <List.Item
                key={item.phone}
                actions={[<IconText type="star-o" text="1" />, <IconText type="like-o" text="1" />, <IconText type="info-circle" text="详情" />]}>
                <List.Item.Meta
                  avatar={<Avatar alt="" style={{ backgroundColor: item.avatarColor || '#1890ff' }}>{item.name.charAt(0).toUpperCase()}</Avatar>}
                  title={<a href={item.href}>{item.name}</a>}
                  description={item.email}/>
              </List.Item>
          )}/>
        </Card>
        <ColleagueForm {...parentMethods} modalVisible={colleagueModalVisible} confirmDirty={confirmDirty}/>
      </div>
    )
  }
}

module.exports = {
  Colleague,
}
