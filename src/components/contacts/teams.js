'use strict'

const React = require('react')
const { PureComponent } = React
const { List, Card, Button, Icon, Avatar, Form, Modal, message, Input } = require('antd')
const FormItem = Form.Item
const axios = require('axios')
const { userInfo } = ARGS
const { getUrlFilterParams } = require('../../common/dataUtil')

const CreateForm = Form.create()(props => {
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
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="团队名称">
        {form.getFieldDecorator('name', {
          rules: [{ required: true, message: '请输入至少2个字符的团队名称！', min: 2 }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
    </Modal>
  )
})

class Teams extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      teamList: []
    }
  }

  componentDidMount() {
    let query = getUrlFilterParams({ userId: userInfo.user.userId }, ['userId'])
    let self = this
    this.setState({ loading: true })
    axios.get(`${ARGS.apiServer}/graphql?query={teamQueryByUserId${query} { teamId name type icon score level levelTitle color UserTeams { isOwner } }}`)
    .then(function (response) {
      if (response.status === 200) {
        self.setState({ teamList: response.data.data.teamQueryByUserId, loading: false })
      }
    })
    .catch(function () {
      message.warning('用户名密码错误, 请重试')
      self.setState({ loading: false })
    })
  }


  handleTeamModalVisible = (flag) => {
    this.setState({
      teamModalVisible: !!flag,
    })
  }

  handleModalVisible = flag => {
    this.setState({
      teamModalVisible: !!flag,
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
      }
    })
    .catch(function () {
      message.warning('系统错误')
    })
  }

  render() {
    const { loading, teamModalVisible, teamList } = this.state
    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    }
    return (
      <div className="cardList">
        <List
          rowKey="id"
          loading={loading}
          grid={{ gutter: 24, lg: 4, md: 3, sm: 2, xs: 1 }}
          dataSource={['', ...teamList]}
          renderItem={item =>
            item ? (
              <List.Item key={item.id}>
                <Card hoverable className="card"
                  actions={[<a><Icon type="plus"/> 新增成员</a>, <a>解散</a>]}>
                  <Card.Meta
                    avatar={<Avatar shape="square" size="large" alt="" style={{ backgroundColor: item.color }}>{item.name.substr(0,1)}</Avatar>}
                    title={<a>{item.name}</a>}
                    description="www.instagram.com"/>
                </Card>
              </List.Item>
            ) : (
              <List.Item>
                <Button type="dashed" className="newButton" onClick={() => this.handleTeamModalVisible(true)}>
                  <Icon type="plus"/> 新增团队
                </Button>
              </List.Item>
            )
          }/>
        <CreateForm {...parentMethods} modalVisible={teamModalVisible} />
      </div>
    )
  }
}

module.exports = {
  Teams,
}
