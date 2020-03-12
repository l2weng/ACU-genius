'use strict'

const React = require('react')
const { PureComponent } = React
const { Row, Col, Card, Tabs, Select, Form } = require('antd')
const { Summary } = require('./summary')
const { TaskList } = require('./taskList')
const { WorkLog } = require('./workLog')
// const { QualitySetting } = require('./qualitySetting')
// const { Members } = require('./members')
const __ = require('underscore')
const { PHOTO, HEAD } = require('../../constants')
const { array, object, string, bool } = require('prop-types')
const TabPane = Tabs.TabPane
const Option = Select.Option
const axios = require('axios')
const { FormattedMessage } = require('react-intl')
const { error } = require('../../common/log')

const INIT_PAGINATION = {
  page: 1,
  results: 10,
  sortField: 'count',
  sortOrder: 'descend' }

class ProjectSummary extends PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      skuData: [],
      logData: [],
      cProjectId: props.activeProject.syncProjectId,
      activityData: [],
      activityType: '',
      userPhotoStatusData: [],
      taskStatuses: {},
      logPagination: INIT_PAGINATION,
      logLoading: false,
    }
  }

  componentDidMount() {
    this.summaryTab = '1'
    this.cActivityType = 'HH'
    if (this.state.cProjectId !== undefined) {
      this.fetchSummary(this.state.cProjectId)
    }
  }

  handleSelectProject = (projectId) =>{
    this.setState({ cProjectId: projectId, logPagination: INIT_PAGINATION })
    this.fetchSummary(projectId)
  }

  fetchSummary = (projectId) =>{
    switch (this.summaryTab) {
      case '1':
        this.fetchProjectSummary(projectId)
        break
      case '4':
        this.fetchUserPhotoStatusData(projectId)
        break
      case '5':
        this.fetchWorkLog(this.state.logPagination, projectId)
        break
      default:
        return
    }
  }

  fetchProjectSummary = (projectId) =>{
    this.fetchSkuCount(projectId)
    this.fetchPhotoStatuses(projectId)
    this.fetchActivityData(this.cActivityType, projectId)
    this.fetchUserPhotoStatusData(projectId)
  }

  fetchSkuCount = (projectId) =>{
    axios.post(`${ARGS.apiServer}/summaries/countTargets`, { projectId }).then((result) =>{
      this.setState({ skuData: result.data })
    }).catch(function (err) {
      error(err.toString())
    })
  }

  fetchUserPhotoStatusData = (projectId) =>{
    axios.post(`${ARGS.apiServer}/summaries/countUserPhotoStatus`, { projectId }).then((result) =>{
      this.setState({ userPhotoStatusData: result.data })
    }).catch(function (err) {
      error(err.toString())
    })
  }

  fetchActivityData = (type, projectId) =>{
    if (this.cActivityType !== type) {
      this.cActivityType = type
    }
    axios.post(`${ARGS.apiServer}/activities/queryByDate`, { projectId, type: this.cActivityType }).then((result) =>{
      this.setState({ activityData: result.data.activityData, activityType: result.data.activityType })
    }).catch(function (err) {
      error(err.toString())
    })
  }

  fetchPhotoStatuses = (projectId) =>{
    axios.post(`${ARGS.apiServer}/summaries/countPhotoStatus`, { projectId }).then((result) =>{
      const taskStatusArr = result.data
      let _taskStatuses = { total: 0, progress: 100, open: 0, skipped: 0, submitted: 0 }
      if (taskStatusArr.length > 0) {
        for (const statusElement of taskStatusArr) {
          if (statusElement.photoStatus === PHOTO.STATUS.OPEN) {
            _taskStatuses.open = statusElement.count
            _taskStatuses.total += statusElement.count
          }
          if (statusElement.photoStatus === PHOTO.STATUS.SKIPPED) {
            _taskStatuses.skipped = statusElement.count
            _taskStatuses.total += statusElement.count
          }
          if (statusElement.photoStatus === PHOTO.STATUS.SUBMITTED) {
            _taskStatuses.submitted = statusElement.count
            _taskStatuses.total += statusElement.count
          }
        }
      }
      _taskStatuses.progress = _taskStatuses.total === 0 ? 0 : (((_taskStatuses.total - _taskStatuses.open) / _taskStatuses.total) * 100).toFixed(0)
      this.setState({ taskStatuses: _taskStatuses })
    }).catch(function (err) {
      error(err.toString())
    })
  }

  fetchWorkLog = (pagination, projectId) =>{
    this.setState({ logLoading: true })
    axios.post(`${ARGS.apiServer}/activities/queryLog`, { projectId, ...pagination }).then((result) =>{
      const logPagination = { ...this.state.logPagination }
      logPagination.total = result.data.total
      this.setState({ logData: result.data.obj, logLoading: false, logPagination })
    }).catch(function (error) {
      console.log(error)
    })
  }

  switchProjectSummaryTab = (tab) =>{
    this.summaryTab = tab
    this.fetchSummary(this.state.cProjectId)
  }

  handleSwitchActivity = (e)=>{
    this.fetchActivityData(e.target.value, this.state.cProjectId)
  }

  handleLogTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.logPagination }
    pager.page = pagination.current
    this.setState({
      pagination: pager,
    })
    this.fetchWorkLog({
      results: pagination.results,
      page: pagination.current,
      sortField: !__.isEmpty(sorter) ? sorter.field : pagination.sortField,
      sortOrder: !__.isEmpty(sorter) ? sorter.order : pagination.sortOrder,
    }, this.state.cProjectId)
  }

  componentWillReceiveProps(props) {
    if (props.activeTab === HEAD.PROJECT) {
      if (this.state.cProjectId !== props.activeProject.syncProjectId) {
        this.handleSelectProject(props.activeProject.syncProjectId)
      } else if (props.needRefresh && this.props.needRefresh === props.needRefresh) {
        this.fetchSummary(this.state.cProjectId)
      }
    }
  }

  renderTitle() {
    const { projects } = this.props
    const { cProjectId } = this.state
    if (projects && projects.length > 0) {
      return (
        <div>
          <Form layout="inline">
            <Form.Item  label={<FormattedMessage id="summary.project"/>}>
              <Select style={{ width: 120 }} defaultValue={cProjectId} value={cProjectId} onChange={this.handleSelectProject}>
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
    const { summaryTab, skuData, logData, logPagination, taskStatuses, activityData, activityType, userPhotoStatusData } = this.state
    return (
      <div>
        <Row gutter={24}>
          <Col span={24}>
            <Card title={this.renderTitle()} bordered={false}>
              <Tabs style={{ textAlign: 'left' }} onChange={this.switchProjectSummaryTab}
                defaultActiveKey={summaryTab}
                tabPosition="left">
                <TabPane tab={<FormattedMessage id="summary.overview"/>} key="1"><Summary
                  skuData={skuData}
                  taskStatuses={taskStatuses}
                  activityType={activityType}
                  userPhotoStatusData={userPhotoStatusData}
                  switchActivityData={this.handleSwitchActivity}
                  activityData={activityData}/></TabPane>
                {/*<TabPane tab="图片数据" key="2"><PhotoData {...props}*/}
                {/*  nav={nav}*/}
                {/*  items={items}*/}
                {/*  data={data}*/}
                {/*  isActive*/}
                {/*  isEmpty={isEmpty}*/}
                {/*  columns={columns}*/}
                {/*  photos={photos}/></TabPane>*/}
                {/*<TabPane tab="项目参与者" key="3"><Members/></TabPane>*/}
                <TabPane tab={<FormattedMessage id="summary.taskList"/>} key="4"><TaskList userPhotoStatusData={userPhotoStatusData}/></TabPane>
                <TabPane tab={<FormattedMessage id="summary.workLog"/>} key="5">
                  <WorkLog
                    logData={logData}
                    pagination={logPagination}
                    loading={this.state.logLoading}
                    onChange={this.handleLogTableChange}/>
                </TabPane>
                {/*<TabPane tab="质量设置" key="6"><QualitySetting/></TabPane>*/}
                <TabPane tab={<FormattedMessage id="summary.dataOutput"/>} key="7">Content of Tab Pane 6</TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
  static propTypes = {
    projects: array,
    activeProject: object,
    activeTab: string,
    needRefresh: bool
  }
}

module.exports = { ProjectSummary }
