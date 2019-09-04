'use strict'

const React = require('react')
const { PureComponent } = React
const { connect } = require('react-redux')
const { Row, Col, Card, List, Radio, Icon, Progress, Button } = require('antd')
const RadioButton = Radio.Button
const RadioGroup = Radio.Group

const { Meta } = Card
const { userInfo } = ARGS
const actions = require('../../actions')
const { func, object, array, bool, string, number } = require('prop-types')
const { HEAD, LIST } = require('../../constants')
const { resolve, join } = require('path')
const staticRoot = resolve(__dirname, '../../../', 'static')
const defaultCover = join(staticRoot, 'images/project', 'default-cover.jpg')
const { TasksTable } = require('./taskTable')
const { existsSync: exists } = require('fs')
const { openNotification } = require('../../common/uiUtil')
const { ipcRenderer: ipc  } = require('electron')
const debounce = require('lodash.debounce')

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

  handleSubmitTask = (task) =>{
    this.props.auditTask({
      id: task.localTaskId,
      syncTaskId: task.taskId,
      workStatus: LIST.STATUS_COMPLETE,
      taskType: this.props.currentTaskType,
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
      cloudMark = <Icon type="cloud" theme="twoTone" twoToneColor={'#8da7d3'}  style={{ float: 'right', paddingTop: '4px', paddingRight: '5px' }}/>
    } else {
      cloudMark = <Icon type="eye-invisible"theme="twoTone" twoToneColor={'#e96529'} style={{ float: 'right', paddingTop: '4px', paddingRight: '5px'  }}/>
    }
    return (<div style={{color:'rgba(0,0,0,.65)'}}>{item.name}{cloudMark}</div>)
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
    const { projects, tasks, currentTaskType } = this.props

    return (
      <div>
        <Row gutter={24}>
          <Col span={24}>
            <Card
              bordered={false}
              title="进行中的项目"
              extra={<a href="#" onClick={debounce(this.createNewProject, 300)}>新建项目</a>}>
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
                        bodyStyle={{ padding: '10px 5px 10px 8px' }}
                        style={{ width: 180, height: 240 }}
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
                          </div>}>
                        <Meta
                          title={this.renderTitle(item)} description={
                            <div style={{ width: (item.progress < 10 || item.progress === 100) ? '169px' : '162px' }}>
                              <Progress percent={item.progress} size="small"/>
                            </div>}/>
                      </Card>
                    </div>
                  </List.Item>
                }/>
            </Card>
            <Card
              bordered={false}
              title={<div>
                <RadioGroup defaultValue={HEAD.JOINED_TASKS} onChange={this.onTaskSwitch}>
                  <RadioButton key={HEAD.ALL_TASKS} value={HEAD.ALL_TASKS}>全部任务</RadioButton>
                  <RadioButton key={HEAD.JOINED_TASKS} value={HEAD.JOINED_TASKS}>参与的任务</RadioButton>
                  <RadioButton key={HEAD.MY_TASKS} value={HEAD.MY_TASKS}>我的任务</RadioButton>
                </RadioGroup>
                {/*<Input.Search className="extraContentSearch" placeholder="请输入" onSearch={() => ({})} />*/}
              </div>}>
              <TasksTable
                tasks={tasks}
                taskType={currentTaskType}
                openProjectById={this.openProjectById}
                onPassTask={this.handlePassTask}
                onSubmitTask={this.handleSubmitTask}
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
    currentTaskType: number,
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
