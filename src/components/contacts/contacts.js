'use strict'

const React = require('react')
const { PureComponent } = React
const { Row, Col, Tabs, Input } = require('antd')
const TabPane = Tabs.TabPane
// const Search = Input.Search
const { Teams } = require('./teams')
const { CoWorkers } = require('./coWorkers')
const { Colleague } = require('./colleague')

class Contacts extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
    }
  }

  render() {
    return (
      <div style={{ paddingTop: '20px' }}>
        <Row gutter={24}>
          <Col span={24}>
            <Tabs style={{ textAlign: 'left' }}
              defaultActiveKey="1"
              tabPosition="left">
              <TabPane tab="公司同事" key="1">
                <Colleague/>
              </TabPane>
              {/*<TabPane tab="人员分组" key="2">*/}
              {/*  <Teams/>*/}
              {/*</TabPane>*/}
              <TabPane tab="平台好友" key="3">
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
