'use strict'

const React = require('react')
const { PureComponent } = React
const { Row, Col, Card, Tabs, Select, Form } = require('antd')
const { Summary } = require('./summary')
const { PhotoData } = require('./photoData')
const { TaskList } = require('./taskList')
const { WorkLog } = require('./workLog')
const { QualitySetting } = require('./qualitySetting')
const { Members } = require('./members')
const { array, bool, func, object, } = require('prop-types')
const TabPane = Tabs.TabPane
const Option = Select.Option
const axios = require('axios')

class ProjectSummary extends PureComponent {

  constructor(props) {
    super(props)
    console.log(props)
    this.state = {
      summaryActiveTab: '1',
      activeProjectId: ''
    }
  }

  componentDidMount() {
    console.log(this.props)
  }

  handleSelectProject = (projectId) =>{
    this.setState({ activeProjectId: projectId })
    this.fetchSummary(projectId)
  }

  fetchSummary = () =>{
    const { summaryActiveTab } = this.state
    let { activeProjectId } = this.state

    switch (summaryActiveTab) {
      case '1':
        this.fetchProjectSummary(activeProjectId)
        break
      case '2':
        break
      default:
        return
    }
  }

  fetchProjectSummary = (projectId) =>{
    axios.post(`${ARGS.apiServer}/summarys/query`, { projectId }).then((result) =>{
      console.log(result)
    }).catch(function (error) {
      console.log(error)
    })
  }

  switchProjectSummaryTab = (tab) =>{
    this.setState({ summaryActiveTab: tab })
  }

  renderTitle() {
    const { projects } = this.props
    if (projects && projects.length > 0) {
      return (
        <div>
          <Form layout="inline">
            <Form.Item  label="项目">
              <Select style={{ width: 120 }} defaultValue={projects[0].projectId} onChange={this.handleSelectProject}>
                {projects.map(project=>{
                  return (<Option value={project.projectId} key={project.projectId}>{project.name}</Option>)
                })}
              </Select>
            </Form.Item>
          </Form>
        </div>
      )
    }
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
    const { summaryActiveTab } = this.state

    return (
      <div>
        <Row gutter={24}>
          <Col span={24}>
            <Card title={this.renderTitle()} bordered={false}>
              <Tabs style={{ textAlign: 'left' }} onChange={this.switchProjectSummaryTab}
                defaultActiveKey={summaryActiveTab}
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
