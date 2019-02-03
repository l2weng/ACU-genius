'use strict'

const React = require('react')
const { PureComponent } = React
const { List, Icon,  Avatar, Card, Form, Modal, Input } = require('antd')
const FormItem = Form.Item
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

const CoWorkerForm = Form.create()(props => {
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
    </Modal>
  )
})

class CoWorkers extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      teamList: [],
      coWorkerModalVisible: false,
    }
  }

  componentDidMount() {
  }

  handleModalVisible = flag => {
    this.setState({
      coWorkerModalVisible: !!flag,
    })
  }

  render() {
    // const { loading, teamModalVisible, teamMemberModalVisible, teamList } = this.state
    // const parentMethods = {
    //   handleAdd: this.handleAdd,
    //   handleModalVisible: this.handleModalVisible,
    // }
    return (
      <div>
        <Card title="我的合作人" bordered={false} extra={<a href="#" onClick={() => this.handleModalVisible(true)}>添加合作人</a>}>
          <List
            itemLayout="vertical"
            size="large"
            grid={{ gutter: 16, column: 4 }}
            dataSource={listData}
            footer={<div><b>footer part</b></div>}
            renderItem={item => (
              <List.Item
                key={item.title}
                actions={[<IconText type="star-o" text="156" />, <IconText type="like-o" text="156" />, <IconText type="message" text="2" />]}>
                <List.Item.Meta
                  avatar={<Avatar src={item.avatar} />}
                  title={<a href={item.href}>{item.title}</a>}
                  description={item.description}/>
              </List.Item>
          )}/>
        </Card>
      </div>
    )
  }
}

module.exports = {
  CoWorkers,
}
