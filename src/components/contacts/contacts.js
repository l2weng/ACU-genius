'use strict'

const React = require('react')
const { PureComponent } = React
const { Row, Col, Tabs, Input, Card, Avatar, Badge } = require('antd')
const TabPane = Tabs.TabPane
const Search = Input.Search
const { Teams } = require('./teams')

class Contacts extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      teamModalVisible: false
    }
  }

  render() {
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
                <Teams/>
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
      </div>
    )
  }
}

module.exports = {
  Contacts
}
