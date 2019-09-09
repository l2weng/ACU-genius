'use strict'

const React = require('react')
const { connect } = require('react-redux')
const { UserInfoContainer } = require('../components/user')
const { Tabs, Icon } = require('antd')
const TabPane = Tabs.TabPane
const { ProjectContainer } = require('../components/project')
const { Contacts } = require('../components/contacts')
const { Workplace } = require('../components/workplace')
const { ProjectSummary } = require('../components/projectSummary')
const actions = require('../actions')
const { HEAD } = require('../constants')
const { userInfo } = ARGS
const _ = require('underscore')

const {
   func, string, object, array
} = require('prop-types')

class Header extends React.Component {

  state = { taskType: HEAD.JOINED_TASKS }

  constructor(props) {
    super(props)
  }

  switchTab = (tabName) => {
    const { project } = this.props
    if (tabName === HEAD.HOME) {
      if (!_.isEmpty(userInfo) && !project.closing) {
        this.props.reloadProjects(true, userInfo.user.userId)
        this.props.reloadTasks(userInfo.user.userId, this.state.taskType)
      }
    }
    this.props.switchTab(tabName, project)
  }

  switchTask = (taskTab) =>{
    this.setState({ taskType: taskTab })
  }

  render() {
    const { activeTab, project, projects } = this.props
    const { taskType } = this.state
    const isOwner = project.owner === userInfo.user.userId
    return (
      <Tabs defaultActiveKey={activeTab} activeKey={activeTab} onChange={this.switchTab} style={{ height: '100%' }} tabBarExtraContent={<UserInfoContainer/>} >
        <TabPane tab={<span><Icon type="dashboard" size="small"/>首页</span>} key={HEAD.HOME} className="tab-container">
          <Workplace switchTab={this.switchTab} switchTask={this.switchTask} isOwner={isOwner} currentTaskType={taskType}/>
        </TabPane>
        <TabPane tab={<span><Icon type="edit" size="small"/>工作台</span>} key={HEAD.WORKSPACE} className="tab-container"><ProjectContainer/></TabPane>
        <TabPane tab={<span><Icon type="line-chart" size="small"/>项目</span>} key={HEAD.PROJECT} className="tab-container"><ProjectSummary activeTab={activeTab} activeProject={project} projects={projects}/></TabPane>
        <TabPane tab={<span><Icon type="team" size="small"/>联系人</span>}  key={HEAD.FRIENDS} className="tab-container"><Contacts/></TabPane>
      </Tabs>
    )
  }

  static propTypes = {
    activeTab: string,
    switchTab: func,
    reloadProjects: func,
    reloadTasks: func,
    project: object,
    projects: array,
  }
}

module.exports = {
  Header: connect(
    state => ({
      activeTab: state.ui.activeTab,
      project: state.project,
      projects: state.header.projects || [],
    }),
    dispatch => ({
      switchTab(tabName, project) {
        if (tabName === HEAD.WORKSPACE && !project.closing) {
          dispatch(actions.list.load({ project: project }))
        }
        dispatch(actions.ui.headerSwitch({ activeTab: tabName }))
      },
      reloadProjects(typeFlag = false, id) {
        dispatch(actions.header.loadProjects({ typeFlag, id }))
      },
      reloadTasks(userId, taskType) {
        dispatch(actions.header.loadMyTasks({ userId, type: taskType }))
      }
    }),
  )(Header),
}
