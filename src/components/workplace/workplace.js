'use strict'

const React = require('react')
const { PureComponent } = React
const { connect } = require('react-redux')
const { Row, Col, Card, List, Radio, Icon, Progress } = require('antd')
const RadioButton = Radio.Button
const RadioGroup = Radio.Group

const { Meta } = Card
const { userInfo } = ARGS
const actions = require('../../actions')
const { func, object, array, bool, string  } = require('prop-types')
const { HEAD, LIST } = require('../../constants')
const { resolve, join } = require('path')
const staticRoot = resolve(__dirname, '../../../', 'static')
const defaultCover = join(staticRoot, 'images/project', 'default-cover.jpg')
const { TasksTable } = require('./taskTable')
const { existsSync: exists } = require('fs')
const { openNotification } = require('../../common/uiUtil')
const { ipcRenderer: ipc  } = require('electron')


const {
  getCachePrefix,
} = require('../../selectors')
class Workplace extends PureComponent {

  constructor(props) {
    super(props)
  }

  openProject = (item) => {
    if (!item.syncStatus && !exists(item.projectFile)) {
      openNotification('warning', '提示', `项目: ${item.name} 尚未同步上云, 暂时无法查看`)
    } else {
      const { project } = this.props
      if (project.syncProjectId !== item.projectId) {
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

  createNewProject = () => {
    ipc.send('cmd', 'app:create-project')
  }

  onTaskSwitch = (e) =>{
    this.props.fetchTasks(userInfo.user.userId, e.target.value)
    this.props.switchTask(e.target.value)
  }

  componentWillReceiveProps(props) {
    if (this.props.project.id !== props.project.id) {
      this.props.switch2Workspace()
    }
  }

  render() {
    const { projects, tasks, isOwner } = this.props

    return (
      <div>
        <Row gutter={24}>
          <Col span={24}>
            <Card
              bordered={false}
              title="进行中的项目"
              extra={<a href="#" onClick={this.createNewProject}>新建项目</a>}>
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
                        style={{ width: 180, height: 260 }}
                        cover={
                          <div>
                            <div style={{
                              overflow: 'hidden',
                            }}><img style={{
                              width: 180,
                              height: 180,
                              objectFit: 'cover',
                            }} alt={item.name}
                              src={this.getCacheCover(item.syncCover
                                      ? item.syncCover
                                      : item.cover)}/>
                            </div>
                            <div style={{ padding: '0 10px 0 5px' }}>
                              <Progress
                                strokeColor={{
                                  from: '#108ee9',
                                  to: '#87d068',
                                }}
                                percent={item.progress}
                                size="small"
                                status="active"/>
                            </div>
                          </div>}>
                        <Meta
                          title={
                          this.renderTitle(item)
                        }/>
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
                  {isOwner ? <RadioGroup defaultValue={HEAD.MY_TASKS} onChange={this.onTaskSwitch}>
                    <RadioButton key={HEAD.MY_TASKS} value={HEAD.MY_TASKS}>我创建的任务</RadioButton>
                    <RadioButton key={HEAD.JOINED_TASKS} value={HEAD.JOINED_TASKS}>分配给我的任务</RadioButton>
                  </RadioGroup> : <RadioGroup defaultValue={HEAD.MY_TASKS} onChange={this.onTaskSwitch}>
                    <RadioButton key={HEAD.JOINED_TASKS} value={HEAD.JOINED_TASKS}>分配给我的任务</RadioButton>
                    <RadioButton key={HEAD.MY_TASKS} value={HEAD.MY_TASKS}>我创建的任务</RadioButton>
                  </RadioGroup>}
                  {/*<Search className="extraContentSearch" placeholder="请输入" onSearch={() => ({})} />*/}
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
    switch2Workspace: func.isRequired,
    fetchProjects: func.isRequired,
    fetchTasks: func.isRequired,
    switchTask: func.isRequired,
    auditTask: func.isRequired,
    cache: string,
    project: object,
    projects: array,
    tasks: array,
    isOwner: bool,
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
        dispatch(actions.list.load({ project: project }))
        dispatch(actions.ui.headerSwitch({ activeTab: HEAD.WORKSPACE }))
      },
      switch2Workspace() {
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
