'use strict'

const React = require('react')
const { PureComponent } = React
const { Row, Col, Card, Tabs, Select, Form } = require('antd')
const { Summary } = require('./summary')
// const { PhotoData } = require('./photoData')
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
    this.state = {
      summaryActiveTab: '1',
      cProjectId: this.props.projects ? this.props.projects[0].projectId : '',
      skuData: [],
      logData: []
    }
  }

  componentDidMount() {
    this.fetchSummary()
  }

  handleSelectProject = (projectId) =>{
    this.setState({ cProjectId: projectId })
    this.fetchSummary()
  }

  fetchSummary = () =>{
    const { summaryActiveTab, cProjectId } = this.state

    switch (summaryActiveTab) {
      case '1':
        this.fetchProjectSummary(cProjectId)
        break
      case '5':
        this.fetchWorkLog(cProjectId)
        break
      default:
        return
    }
  }

  fetchProjectSummary = (projectId) =>{
    axios.post(`${ARGS.apiServer}/summaries/countSkus`, { projectId }).then((result) =>{
      if (result.data.length > 0) {
        this.setState({ skuData: result.data })
      }
    }).catch(function (error) {
      console.log(error)
    })
  }

  fetchWorkLog = (projectId) =>{
    axios.post(`${ARGS.apiServer}/activities/queryLog`, { projectId }).then((result) =>{
      if (result.data.length > 0) {
        this.setState({ logData: result.data })
      }
    }).catch(function (error) {
      console.log(error)
    })
  }

  switchProjectSummaryTab = (tab) =>{
    this.setState({ summaryActiveTab: tab })
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
    // const {
    //   columns,
    //   data,
    //   items,
    //   nav,
    //   photos,
    //   isEmpty,
    //   ...props
    // } = this.props
    const { summaryActiveTab, skuData, logData } = this.state
    return (
      <div>
        <Row gutter={24}>
          <Col span={24}>
            <Card title={this.renderTitle()} bordered={false}>
              <Tabs style={{ textAlign: 'left' }} onChange={this.switchProjectSummaryTab}
                defaultActiveKey={summaryActiveTab}
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
                <TabPane tab="项目参与者" key="3"><Members/></TabPane>
                <TabPane tab="任务列表" key="4"><TaskList/></TabPane>
                <TabPane tab="工作日志" key="5"><WorkLog logData={logData}/></TabPane>
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
    // isActive: bool,
    // isEmpty: bool.isRequired,
    isOver: bool,
    // items: array.isRequired,
    keymap: object.isRequired,
    // nav: object.isRequired,
    // photos: object.isRequired,
    tags: object.isRequired,
    onItemCreate: func.isRequired,
    onDataSetsCreate: func.isRequired,
    onItemImport: func.isRequired,
    onItemSelect: func.isRequired,
    onItemTagAdd: func.isRequired,
    onMaximize: func.isRequired,
    onSearch: func.isRequired,
    onSort: func.isRequired,
    onUiUpdate: func.isRequired,
    projects: array
  }
}

module.exports = { ProjectSummary }
