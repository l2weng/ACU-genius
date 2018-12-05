'use strict'

const React = require('react')
const { PureComponent } = React
const { Row, Col, Card, Tabs } = require('antd')
const { Summary } = require('./summary')
const { TaskList } = require('./taskList')
const { Members } = require('./members')
const TabPane = Tabs.TabPane

class ProjectSummary extends PureComponent {
  componentDidMount() {

  }

  componentWillUnmount() {

  }
  render() {

    return (
      <div>
        <Row gutter={24}>
          <Col span={24}>
            <Card title="Telsa Project" bordered={false}>
              <Tabs style={{ textAlign: 'left' }}
                defaultActiveKey="1"
                tabPosition="left">
                <TabPane tab="项目概述" key="1"><Summary/></TabPane>
                <TabPane tab="图片数据" key="2">Content of Tab Pane 2</TabPane>
                <TabPane tab="项目参与者" key="3"><Members/></TabPane>
                <TabPane tab="任务列表" key="4"><TaskList/></TabPane>
                <TabPane tab="工作日志" key="5">Content of Tab Pane 5</TabPane>
                <TabPane tab="数据导出" key="6">Content of Tab Pane 6</TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

module.exports = { ProjectSummary }
