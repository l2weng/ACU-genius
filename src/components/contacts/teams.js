'use strict'

const React = require('react')
const { PureComponent } = React
const { List, Card, Button, Icon, Avatar, Form, Modal, message, Input } = require('antd')
const FormItem = Form.Item
const axios = require('axios')
const { userInfo } = ARGS
const { getUrlFilterParams } = require('../../common/dataUtil')
const { TextArea } = Input
const _ = require('underscore')

const TeamForm = Form.create()(props => {
  const { modalVisible, form, handleAdd, handleModalVisible } = props
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
      title="新建团队"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="名称">
        {form.getFieldDecorator('name', {
          rules: [{ required: true, message: '请输入至少2个字符的团队名称！', min: 2 }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} key="desc" wrapperCol={{ span: 15 }} label="描述">
        {form.getFieldDecorator('desc', {
        })(<TextArea rows={4} placeholder="至多输入500个字符" />)}
      </FormItem>
    </Modal>
  )
})

const MemberForm = Form.create()(props => {
  const { memberModalVisible, form, handleMemberAdd, handleMemberModalVisible } = props
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return
      form.resetFields()
      handleMemberAdd(fieldsValue)
    })
  }
  return (
    <Modal
      destroyOnClose
      title="新建团队"
      visible={memberModalVisible}
      onOk={okHandle}
      onCancel={() => handleMemberModalVisible()}>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="名称">
        {form.getFieldDecorator('name', {
          rules: [{ required: true, message: '请输入至少2个字符的团队名称！', min: 2 }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} key="desc" wrapperCol={{ span: 15 }} label="描述">
        {form.getFieldDecorator('desc', {
        })(<TextArea rows={4} placeholder="至多输入500个字符" />)}
      </FormItem>
    </Modal>
  )
})

class Teams extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      teamList: [],
      teamModalVisible: false,
      teamMemberModalVisible: false
    }
  }

  componentDidMount() {
    if (!_.isEmpty(userInfo.user)) {
      this.fetchTeamsWithUser()
    }
  }

  fetchTeamsWithUser = () => {
    let query = getUrlFilterParams({ userId: userInfo.user.userId, isOwner: true }, ['userId', 'isOwner'])
    let self = this
    this.setState({ loading: true })
    axios.get(`${ARGS.apiServer}/graphql?query={teamQueryByUserId${query} { teamId name desc type icon score level levelTitle avatarColor UserTeams { isOwner } }}`)
    .then(function (response) {
      if (response.status === 200) {
        self.setState({ teamList: response.data.data.teamQueryByUserId, loading: false })
      }
    })
    .catch(function () {
      message.warning('团队不存在, 请重试')
      self.setState({ loading: false })
    })
  }

  handleModalVisible = flag => {
    this.setState({
      teamModalVisible: !!flag,
    })
  }

  handleMemberModalVisible = flag => {
    this.setState({
      teamMemberModalVisible: !!flag,
    })
  }

  handleAdd = fields => {
    let self = this
    fields.userId = userInfo.user.userId
    axios.post(`${ARGS.apiServer}/teams/create`, fields)
    .then(function (response) {
      if (response.status === 200) {
        self.handleModalVisible()
        message.success('添加成功', 0.5)
        self.fetchTeamsWithUser()
      }
    })
    .catch(function () {
      message.warning('系统错误')
    })
  }

  handleMemberAdd = fields => {
    let self = this
    fields.userId = userInfo.user.userId
    axios.post(`${ARGS.apiServer}/teams/create`, fields)
    .then(function (response) {
      if (response.status === 200) {
        self.handleModalVisible()
        message.success('添加成功', 0.5)
        self.fetchTeamsWithUser()
      }
    })
    .catch(function () {
      message.warning('系统错误')
    })
  }

  render() {
    const { loading, teamModalVisible, teamMemberModalVisible, teamList } = this.state
    const parentMethods = {
      handleAdd: this.handleAdd,
      handleMemberAdd: this.handleMemberAdd,
      handleModalVisible: this.handleModalVisible,
      handleMemberModalVisible: this.handleMemberModalVisible,
    }
    return (
      <div className="cardList">
        <Card title="人员分组" bordered={false}>
          <List
            rowKey="id"
            loading={loading}
            grid={{ gutter: 24, lg: 4, md: 3, sm: 2, xs: 1 }}
            dataSource={['', ...teamList]}
            renderItem={item =>
            item ? (
              <List.Item key={item.id}>
                <Card hoverable className="card"
                  actions={[<a><Icon type="plus" onClick={() => this.handleMemberModalVisible(true)}/> 添加成员</a>, <a>修改</a>]}>
                  <Card.Meta
                    avatar={<Avatar shape="square" size="large" alt="" style={{ backgroundColor: item.avatarColor }}>{item.name.substr(0, 1)}</Avatar>}
                    title={<a>{item.name}</a>}
                    description={item.desc}/>
                </Card>
              </List.Item>
            ) : (
              <List.Item>
                <Button type="dashed" className="newButton" onClick={() => this.handleModalVisible(true)}>
                  <Icon type="plus"/> 添加团队
                </Button>
              </List.Item>
            )
          }/>
        </Card>
        <TeamForm {...parentMethods} modalVisible={teamModalVisible} />
        <MemberForm {...parentMethods} modalVisible={teamMemberModalVisible} />
      </div>
    )
  }
}

module.exports = {
  Teams,
}
