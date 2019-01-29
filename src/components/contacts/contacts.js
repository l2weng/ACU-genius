'use strict'

const React = require('react')
const { PureComponent } = React
const { Row, Col, Tabs, Input, Card, Avatar, Badge, Form, Modal, message } = require('antd')
const TabPane = Tabs.TabPane
const Search = Input.Search
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

class Contacts extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      teamModalVisible: false
    }
  }

  componentDidMount() {

  }

  componentWillUnmount() {

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
        message.success('添加成功', 0.5, ()=>{
          self.handleModalVisible()
        })
      }
    })
    .catch(function (error) {
      message.warning('系统错误')
    })
  }

  render() {
    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    }
    const { teamModalVisible } = this.state
    return (
      <div>
        <Row gutter={24}>
          <Col span={24} style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', paddingTop: '5px', paddingBottom: '5px', paddingRight: '78px' }}>
            <Search
              placeholder="搜索联系人"
              onSearch={value => console.log(value)}
              style={{ width: 300 }}/>
          </Col>
          <Col span={24}>
            <Tabs style={{ textAlign: 'left' }}
              defaultActiveKey="1"
              tabPosition="left">
              <TabPane tab="全部联系人" key="1">
                <Card
                  title="全部联系人"
                  extra={<a href="#">添加联系人</a>}
                  style={{ width: '95%' }}>
                  <Avatar style={{ backgroundColor: '#4e72ab' }} icon="user" />
                  <Avatar style={{ backgroundColor: '#c32964' }}>Terry</Avatar>
                  <Avatar style={{ backgroundColor: '#ffd6a6' }}>Louis</Avatar>
                  <Badge count={1}><Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" /></Badge>
                  <Avatar style={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>U</Avatar>
                  <Avatar style={{ backgroundColor: '#87d068' }} icon="user" />
                </Card>
              </TabPane>
              <TabPane tab="我的团队" key="2">
                <Card
                  title="无人驾驶团队"
                  extra={<a onClick={() => this.handleTeamModalVisible(true)}>添加团队</a>}
                  style={{ width: '95%' }}>
                  <p><Avatar style={{ backgroundColor: '#feff86' }} icon="user" />
                    <Avatar style={{ backgroundColor: '#c32964' }}>King</Avatar>
                    <Avatar style={{ backgroundColor: '#ffd6a6' }}>Freedom</Avatar>
                    <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                    <Avatar style={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>U</Avatar>
                    <Avatar style={{ backgroundColor: '#87d068' }} icon="rocket" /></p>
                </Card>
              </TabPane>
              <TabPane tab="我的同事" key="3">
                <Card
                  title="智能识别同事团"
                  extra={<a href="#">添加同事</a>}
                  style={{ width: '95%' }}>
                  <p><Avatar style={{ backgroundColor: '#feff86' }} icon="user" />
                    <Avatar style={{ backgroundColor: '#c32964' }}>King</Avatar>
                    <Avatar style={{ backgroundColor: '#ffd6a6' }}>Freedom</Avatar>
                    <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                    <Avatar style={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>KIKI</Avatar>
                    <Avatar style={{ backgroundColor: '#87d068' }} icon="car" /></p>
                </Card>
              </TabPane>
            </Tabs>
          </Col>
        </Row>
        <CreateForm {...parentMethods} modalVisible={teamModalVisible} />
      </div>
    )
  }
}

module.exports = {
  Contacts: Contacts
}
