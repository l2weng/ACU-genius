'use strict'

const React = require('react')
const { PureComponent } = React
const { List, Card, Button, Icon, Avatar, Form, Modal, message, Input } = require('antd')
const FormItem = Form.Item
const axios = require('axios')
const { userInfo } = ARGS

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
    }
  }

  componentDidMount() {

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
    .catch(function (error) {
      message.warning('系统错误')
    })
  }

  render() {
    const { loading,teamModalVisible } = this.state
    const list = [
      { title: '射手', name: '鲁' },
      { title: '战士', name: '亚' },
      { title: '法师', name: '墨' },
      { title: '刺客', name: '典' }]
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
          dataSource={['', ...list]}
          renderItem={item =>
            item ? (
              <List.Item key={item.id}>
                <Card hoverable className="card"
                  actions={[<a>操作一</a>, <a>操作二</a>]}>
                  <Card.Meta
                    avatar={<Avatar alt="" className="cardAvatar" style={{ backgroundColor: '#87d068' }}>{item.name}</Avatar>}
                    title={<a>{item.title}</a>}
                    description="www.instagram.com"/>
                </Card>
              </List.Item>
            ) : (
              <List.Item>
                <Button type="dashed" className="newButton" onClick={() => this.handleTeamModalVisible(true)}>
                  <Icon type="plus"/> 新增Team
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
