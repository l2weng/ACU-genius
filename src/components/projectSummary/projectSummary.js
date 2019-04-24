'use strict'

const React = require('react')
const { PureComponent } = React
const { Row, Col, Card, Tabs } = require('antd')
const { Summary } = require('./summary')
const { PhotoData } = require('./photoData')
const { TaskList } = require('./taskList')
const { WorkLog } = require('./workLog')
const { QualitySetting } = require('./qualitySetting')
const { Members } = require('./members')
const { array, bool, func, object, } = require('prop-types')
const TabPane = Tabs.TabPane

class ProjectSummary extends PureComponent {
  componentDidMount() {

  }

  render() {
    const {
      columns,
      data,
      items,
      nav,
      photos,
      isEmpty,
      ...props
    } = this.props
    console.log(this.props)
    return (
      <div>
        <Row gutter={24}>
          <Col span={24}>
            <Card title="Telsa Project" bordered={false}>
              <Tabs style={{ textAlign: 'left' }}
                defaultActiveKey="1"
                tabPosition="left">
                <TabPane tab="项目概述" key="1"><Summary/></TabPane>
                <TabPane tab="图片数据" key="2"><PhotoData {...props}
                  nav={nav}
                  items={items}
                  data={data}
                  isActive
                  isEmpty={isEmpty}
                  columns={columns}
                  photos={photos}/></TabPane>
                <TabPane tab="项目参与者" key="3"><Members/></TabPane>
                <TabPane tab="任务列表" key="4"><TaskList/></TabPane>
                <TabPane tab="工作日志" key="5"><WorkLog/></TabPane>
                <TabPane tab="质量设置" key="6"><QualitySetting/></TabPane>
                <TabPane tab="数据导出" key="7">Content of Tab Pane 6</TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
  static propTypes = {
    canDrop: bool,
    edit: object.isRequired,
    isActive: bool,
    isEmpty: bool.isRequired,
    isOver: bool,
    items: array.isRequired,
    keymap: object.isRequired,
    nav: object.isRequired,
    photos: object.isRequired,
    tags: object.isRequired,
    onItemCreate: func.isRequired,
    onDataSetsCreate: func.isRequired,
    onItemImport: func.isRequired,
    onItemSelect: func.isRequired,
    onItemTagAdd: func.isRequired,
    onMaximize: func.isRequired,
    onSearch: func.isRequired,
    onSort: func.isRequired,
    onUiUpdate: func.isRequired
  }
}

module.exports = { ProjectSummary }
