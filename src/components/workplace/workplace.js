'use strict'

const React = require('react')
const { PureComponent } = React
const { connect } = require('react-redux')
const { Row, Col, Card, List, Radio, Input, Icon } = require('antd')
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const { Search } = Input

const { Meta } = Card
const _ = require('underscore')
const { userInfo, machineId } = ARGS
const actions = require('../../actions')
const { func, object, array, string  } = require('prop-types')
const { HEAD, LIST } = require('../../constants')
const { resolve, join } = require('path')
const staticRoot = resolve(__dirname, '../../../', 'static')
const defaultCover = join(staticRoot, 'images/project', 'default-cover.jpg')
const { TasksTable } = require('./taskTable')
const { existsSync: exists } = require('fs')
const { openNotification } = require('../../common/uiUtil')

const {
  getCachePrefix,
} = require('../../selectors')
class Workplace extends PureComponent {

  constructor(props) {
    super(props)
  }

  openProject = (item) => {
    if (!item.syncStatus && !exists(item.projectFile)) {
      openNotification('warning', '提示', `项目: ${item.name} 尚未同步, 暂时无法查看`)
    } else {
      const { project } = this.props
      if (project.id !== item.localProjectId) {
        this.props.onProjectOpen(item.projectFile)
      } else {
        this.props.switchTab(this.props.project)
      }
    }
  }

  openProjectById = (projectId) =>{
    const { projects } = this.props
    projects.map(p=>{
      if (p.projectId === projectId) {
        this.openProject(p)
      }
    })
  }

  handlePassTask = (task) =>{
    this.props.auditTask({
      id: task.localTaskId,
      syncTaskId: task.taskId,
      workStatus: LIST.STATUS_CONFIRMED,
      taskType: this.props.currentTaskType,
    })
  }

  handleRollbackTask = (task) =>{
    this.props.auditTask({
      id: task.localTaskId,
      syncTaskId: task.taskId,
      workStatus: LIST.STATUS_WORKING,
      taskType: this.props.currentTaskType,
    })
  }

  renderTitle(item) {
    let cloudMark = ''
    if (item.syncStatus) {
      cloudMark = <Icon type="cloud" theme="twoTone" twoToneColor="cyan" style={{ float: 'right' }}/>
    } else {
      cloudMark = <Icon type="eye-invisible" style={{ float: 'right' }}/>
    }
    return (<div><a onClick={()=>this.openProject(
      item)}>{item.name}</a>{cloudMark}</div>)
  }


  getCacheCover = (cover) => {
    return cover ? cover : defaultCover
  }

  onTaskSwitch = (e) =>{
    this.props.fetchTasks(userInfo.user.userId, e.target.value)
    this.props.switchTask(e.target.value)
  }

  componentWillReceiveProps(props) {
    if (this.props.project.id !== props.project.id) {
      this.props.switchTab(this.props.project)
    }
  }

  render() {
    const { projects, tasks } = this.props

    return (
      <div>
        <Row gutter={24}>
          <Col span={24}>
            <Card
              bordered={false}
              title="进行中的项目">
              <List
                rowKey="id"
                loading={false}
                grid={{ gutter: 24, lg: 6, md: 3, sm: 2, xs: 1 }}
                dataSource={[...projects]}
                renderItem={item =>
                  <List.Item key={item.projectId}>
                    <div onClick={()=>this.openProject(
                      item)}>
                      <Card
                        hoverable
                        style={{ width: 180, height: 273 }}
                        cover={<img alt={item.name}
                          src={this.getCacheCover(item.syncCover)}/>}>
                        <Meta
                          title={
                          this.renderTitle(item)
                        }
                          description={item.name}/>
                      </Card>
                    </div>
                  </List.Item>
                }/>
            </Card>
            <Card
              bordered={false}
              title="进行中的任务"
              extra={
                <div>
                  <RadioGroup defaultValue="myTasks" onChange={this.onTaskSwitch}>
                    <RadioButton key={HEAD.MY_TASKS} value={HEAD.MY_TASKS}>我的任务</RadioButton>
                    <RadioButton key={HEAD.JOINED_TASKS} value={HEAD.JOINED_TASKS}>参与的任务</RadioButton>
                  </RadioGroup>
                  <Search className="extraContentSearch" placeholder="请输入" onSearch={() => ({})} />
                </div>
              }>
              <TasksTable tasks={tasks} openProjectById={this.openProjectById}
                onPassTask={this.handlePassTask}
                onRollbackTask={this.handleRollbackTask}/>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
  static propTypes = {
    onProjectOpen: func.isRequired,
    switchTab: func.isRequired,
    fetchProjects: func.isRequired,
    fetchTasks: func.isRequired,
    switchTask: func.isRequired,
    auditTask: func.isRequired,
    cache: string,
    project: object,
    projects: array,
    tasks: array,
    currentTaskType: string,
  }
}

module.exports = {
  Workplace: connect(
    state => ({
      project: state.project,
      cache: getCachePrefix(state),
      projects: state.header.projects || [],
      tasks: state.header.tasks || []
    }),
    dispatch => ({
      switchTab(project) {
        dispatch(actions.list.loadFromCloud({ project: project }))
        dispatch(actions.ui.headerSwitch({ activeTab: HEAD.WORKSPACE }))
      },
      onProjectOpen(path) {
        dispatch(actions.project.open(path))
      },
      fetchProjects(typeFlag = false, id) {
        dispatch(actions.header.loadProjects({ typeFlag, id }))
      },
      fetchTasks(userId, type) {
        dispatch(actions.header.loadMyTasks({ userId, type: type }))
      },
      auditTask(...args) {
        dispatch(actions.list.submitTask(...args))
      }
    }),
  )(Workplace),
}
