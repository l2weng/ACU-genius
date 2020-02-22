'use strict'

const React = require('react')
const { PureComponent } = React
const { List,  Avatar, Card, Form, Modal, message } = require('antd')
const { FormattedMessage, intlShape, injectIntl } = require('react-intl')
const { userInfo } = ARGS
const _ = require('underscore')
const axios = require('axios')
const { WorkersTable } = require('./workersTable')
const { array } = require('prop-types')

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
      title={<FormattedMessage id="contacts.addFriend"/>}
      visible={modalVisible}
      onOk={okHandle}
      footer={null}
      onCancel={() => handleModalVisible()}>
      <WorkersTable data={otherWorks}/>
    </Modal>
  )
})
const CoWorkers = injectIntl(class extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      otherWorks: [],
      modalVisible: false,
    }
  }

  handleModalVisible = flag => {
    let self = this
    axios.get(`${ARGS.apiServer}/graphql?query={userQueryActiveContacts { key: userId userId name email status phone userType userTypeDesc statusDesc avatarColor }}`)
    .then(function (response) {
      if (response.status === 200) {
        let myCoWorks = response.data.data.userQueryActiveContacts
        self.setState({ otherWorks: myCoWorks.length > 0 ? myCoWorks.filter(work=>work.userId !== userInfo.user.userId) : [], modalVisible: !!flag })
      }
    })
    .catch(function () {
      message.error(self.props.intl.formatMessage({ id: 'common.error' }))
    })
  }

  render() {
    const { loading, modalVisible, otherWorks } = this.state
    const { coWorks } = this.props
    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    }
    return (
      <div>
        <Card title={<FormattedMessage id="contacts.friend"/>} bordered={false} extra={<a href="#" onClick={() => this.handleModalVisible(true)}><FormattedMessage id="contacts.addFriend"/></a>}>
          <List
            itemLayout="vertical"
            size="large"
            loading={loading}
            grid={{ gutter: 16, column: 4 }}
            dataSource={coWorks}
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
        <CoWorkerForm {...parentMethods} modalVisible={modalVisible} otherWorks={otherWorks}/>
      </div>
    )
  }
  static propTypes = {
    intl: intlShape.isRequired,
    coWorks: array.isRequired,
  }
})

module.exports = {
  CoWorkers,
}
