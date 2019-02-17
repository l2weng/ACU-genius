'use strict'

const React = require('react')
const { PureComponent } = React
const { List, Icon,  Avatar, Card, Form, Modal, Input, message, Button } = require('antd')
const { getUrlFilterParams } = require('../../common/dataUtil')
const { userInfo } = ARGS
const FormItem = Form.Item
const _ = require('underscore')
const axios = require('axios')
const { WorkersTable } = require('./workersTable')

const IconText = ({ type, text }) => (
  <span>
    <Icon type={type} style={{ marginRight: 8 }} />
    {text}
  </span>
)

const CoWorkerForm = Form.create()(props => {
  const { modalVisible, form, handleAdd, handleModalVisible, otherWorks } = props
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
      title="添加合作人"
      visible={modalVisible}
      onOk={okHandle}
      footer={null}
      onCancel={() => handleModalVisible()}>
      <WorkersTable data={otherWorks}/>
    </Modal>
  )
})

class CoWorkers extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      coWorks: [],
      otherWorks: [],
      modalVisible: false,
    }
  }

  componentDidMount() {
    if (!_.isEmpty(userInfo.user)) {
      this.fetchCoWorks()
    }
  }

  fetchCoWorks = () => {
    let query = getUrlFilterParams({ userId: userInfo.user.userId, isOwner: true }, ['userId', 'isOwner'])
    let self = this
    this.setState({ loading: true })
    axios.get(`${ARGS.apiServer}/graphql?query={userQueryContacts${query} { key: userId name email avatarColor }}`)
    .then(function (response) {
      if (response.status === 200) {
        self.setState({ coWorks: response.data.data.userQueryContacts, loading: false })
      }
    })
    .catch(function () {
      message.warning('合作人不存在, 请重试')
      self.setState({ loading: false })
    })
  }

  handleModalVisible = flag => {
    let self = this
    axios.get(`${ARGS.apiServer}/graphql?query={userQueryActiveContacts { userId name email status phone userType userTypeDesc statusDesc avatarColor }}`)
    .then(function (response) {
      if (response.status === 200) {
        self.setState({ otherWorks: response.data.data.userQueryActiveContacts, modalVisible: !!flag })
      }
    })
    .catch(function () {
      message.warning('查询服务连接失败, 请重试')
    })
  }

  render() {
    const { loading, modalVisible, coWorks, otherWorks } = this.state
    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    }
    return (
      <div>
        <Card title="平台好友" bordered={false} extra={<a href="#" onClick={() => this.handleModalVisible(true)}>添加合作人</a>}>
          <List
            itemLayout="vertical"
            size="large"
            loading={loading}
            grid={{ gutter: 16, column: 4 }}
            dataSource={coWorks}
            renderItem={item => (
              <List.Item
                key={item.phone}
                actions={[<IconText type="star-o" text="156" />, <IconText type="like-o" text="156" />, <IconText type="info-circle" text="详情" />]}>
                <List.Item.Meta
                  avatar={<Avatar alt="" style={{ backgroundColor: item.avatarColor || '#1890ff' }}>{item.name.charAt(0)}</Avatar>}
                  title={<a href={item.href}>{item.name}</a>}
                  description={item.email}/>
              </List.Item>
            )}/>
        </Card>
        <CoWorkerForm {...parentMethods} modalVisible={modalVisible} otherWorks={otherWorks}/>
      </div>
    )
  }
}

module.exports = {
  CoWorkers,
}
