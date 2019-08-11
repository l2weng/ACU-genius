'use strict'

const React = require('react')
const { PureComponent } = React
const { Row, Col, Card, Tabs, Select, Form } = require('antd')
const { Summary } = require('./summary')
const { TaskList } = require('./taskList')
const { WorkLog } = require('./workLog')
const { QualitySetting } = require('./qualitySetting')
const { Members } = require('./members')
const { array } = require('prop-types')
const TabPane = Tabs.TabPane
const Option = Select.Option
const axios = require('axios')

class ProjectSummary extends PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      skuData: [],
      logData: []
    }
  }

  componentDidMount() {
    this.cProjectId = this.props.projects ? this.props.projects[0].projectId : ''
    this.summaryTab = '1'
    this.fetchSummary()
  }

  handleSelectProject = (projectId) =>{
    this.cProjectId = projectId
    this.fetchSummary()
  }

  fetchSummary = () =>{
    switch (this.summaryTab) {
      case '1':
        this.fetchProjectSummary(this.cProjectId)
        break
      case '5':
        this.fetchWorkLog(this.cProjectId)
        break
      default:
        return
    }
  }

  fetchProjectSummary = (projectId) =>{
    axios.post(`${ARGS.apiServer}/summaries/countSkus`, { projectId }).then((result) =>{
      this.setState({ skuData: result.data })
    }).catch(function (error) {
      console.log(error)
    })
  }

  fetchWorkLog = (projectId) =>{
    axios.post(`${ARGS.apiServer}/activities/queryLog`, { projectId }).then((result) =>{
      this.setState({ logData: result.data.obj })
    }).catch(function (error) {
      console.log(error)
    })
  }

  switchProjectSummaryTab = (tab) =>{
    this.summaryTab = tab
    this.fetchSummary()
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
    const { summaryTab, skuData, logData } = this.state
    return (
      <div>
        <Row gutter={24}>
          <Col span={24}>
            <Card title={this.renderTitle()} bordered={false}>
              <Tabs style={{ textAlign: 'left' }} onChange={this.switchProjectSummaryTab}
                defaultActiveKey={summaryTab}
                tabPosition="left">
                <TabPane tab="项目概述" key="1"><Summary skuData={skuData}/></TabPane>
                {/*<TabPane tab="图片数据" key="2"><PhotoData {...props}*/}
                {/*  nav={nav}*/}
                {/*  items={items}*/}
                {/*  data={data}*/}
                {/*  isActive*/}
                {/*  isEmpty={isEmpty}*/}
                {/*  columns={columns}*/}
                {/*  photos={photos}/></TabPane>*/}
                {/*<TabPane tab="项目参与者" key="3"><Members/></TabPane>*/}
                <TabPane tab="任务列表" key="4"><TaskList/></TabPane>
                <TabPane tab="工作日志" key="5"><WorkLog logData={logData}/></TabPane>
                {/*<TabPane tab="质量设置" key="6"><QualitySetting/></TabPane>*/}
                <TabPane tab="数据导出" key="7">Content of Tab Pane 6</TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
  static propTypes = {
    projects: array
  }
}

module.exports = { ProjectSummary }
