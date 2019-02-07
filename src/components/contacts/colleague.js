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
  }

  handleColleagueModalVisible = flag => {
    this.setState({
      colleagueModalVisible: !!flag,
    })
  }

  render() {
    const { loading, colleagueModalVisible, teamList } = this.state
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
        <ColleagueForm {...parentMethods} modalVisible={colleagueModalVisible} />
      </div>
    )
  }
}

module.exports = {
  Colleague,
}
