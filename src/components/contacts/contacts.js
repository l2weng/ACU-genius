'use strict'

const React = require('react')
const { PureComponent } = React
const { Row, Col, Tabs, Input } = require('antd')
const TabPane = Tabs.TabPane
const Search = Input.Search
const { Teams } = require('./teams')
const { CoWorkers } = require('./coWorkers')
const { Colleague } = require('./colleague')

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
              <TabPane tab="我的同事" key="1">
                <Colleague/>
              </TabPane>
              <TabPane tab="我的团队" key="2">
                <Teams/>
              </TabPane>
              <TabPane tab="我的合作人" key="3">
                <CoWorkers/>
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
