'use strict'

const React = require('react')
const { PureComponent } = React
const { List, Icon,  Avatar, Card, Form, Modal, Input, message } = require('antd')
const { getUrlFilterParams } = require('../../common/dataUtil')
const { userInfo } = ARGS
const FormItem = Form.Item
const axios = require('axios')
const listData = []
for (let i = 0; i < 10; i++) {
  listData.push({
    href: 'http://ant.design',
    title: `合作人 ${i}`,
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
    description: 'Ant Design, a design language for background ',
  })
}

const IconText = ({ type, text }) => (
  <span>
    <Icon type={type} style={{ marginRight: 8 }} />
    {text}
  </span>
)

const ColleagueForm = Form.create()(props => {
  const { modalVisible, form, handleAdd, handleColleagueModalVisible } = props
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return
      form.resetFields()
      handleAdd(fieldsValue)
    })
  }
  return (
    <Modal
      destroyOnClose
      title="添加同事"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleColleagueModalVisible()}>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="名称">
        {form.getFieldDecorator('name', {
          rules: [{ required: true, message: '请输入至少2个字符的名称！', min: 2 }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem
        labelCol={{ span: 5 }} wrapperCol={{ span: 15 }}
        label="E-mail">
        {form.getFieldDecorator('email', {
          rules: [{
            type: 'email', message: 'E-mail不合法!',
          }, {
            required: true, message: '请输入 E-mail!',
          }],
        })(
          <Input  placeholder="请输入" />
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
    }
  }

  componentDidMount() {
    this.fetchColleagues()
  }

  fetchColleagues = () => {
    let query = getUrlFilterParams({ userId: userInfo.user.userId, companyId: userInfo.user.companyId, isOwner: true }, ['userId', 'isOwner', 'companyId'])
    let self = this
    this.setState({ loading: true })
    axios.get(`${ARGS.apiServer}/graphql?query={userQueryContacts${query} { userId name email status phone userType userTypeDesc statusDesc avatarColor }}`)
    .then(function (response) {
      if (response.status === 200) {
        self.setState({ colleagueList: response.data.data.userQueryContacts, loading: false })
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
    const { loading, colleagueModalVisible, colleagueList } = this.state
    const parentMethods = {
      handleAdd: this.handleAdd,
      handleColleagueModalVisible: this.handleColleagueModalVisible,
    }
    return (
      <div>
        <Card title="我的同事" bordered={false} extra={<a href="#" onClick={() => this.handleColleagueModalVisible(true)}>添加同事</a>}>
          <List
            itemLayout="vertical"
            size="large"
            loading={loading}
            grid={{ gutter: 16, column: 4 }}
            dataSource={colleagueList}
            renderItem={item => (
              <List.Item
                key={item.phone}
                actions={[<IconText type="star-o" text="156" />, <IconText type="like-o" text="156" />, <IconText type="message" text="2" />]}>
                <List.Item.Meta
                  avatar={<Avatar alt="" style={{ backgroundColor: item.avatarColor || '#1890ff' }}>{item.name.charAt(0)}</Avatar>}
                  title={<a href={item.href}>{item.phone}</a>}
                  description={item.email}/>
              </List.Item>
          )}/>
        </Card>
        <ColleagueForm {...parentMethods} modalVisible={colleagueModalVisible} />
      </div>
    )
  }
}

module.exports = {
  Colleague,
}
