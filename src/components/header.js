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
    const LRSvg = () => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 73.38 95.84" width="1em" height="1em">
        <g id="lrLine2">
          <rect fill="#ec6519" x="8.7" y="22.77" width="4.25" height="73.07"  rx="2.13"/>
          <rect fill="#e71f1b" width="48.23" height="4.6" rx="2.3"/>
          <rect fill="#e71f1b" width="4.02" height="95.84" rx="2.01"/>
          <rect fill="#486aad" x="9.05" y="10.41" width="64.33" height="4.51" rx="2.26"/>
          <rect fill="#486aad" x="19.6" y="30.74" width="62.2" height="4.69" rx="2.35" transform="translate(-8.55 45.54) rotate(-45)"/>
          <rect fill="#486aad" x="19.81" y="70.76" width="60.69" height="4.69" rx="2.31" transform="translate(66.38 -14.05) rotate(45)"/>
          <rect fill="#8da7d6" x="18.29" y="29.21" width="36.43" height="4.77" rx="2.38" transform="translate(-11.65 35.07) rotate(-45)"/>
          <rect fill="#9ab8d6" x="40.11" y="65.98" width="36.43" height="4.77" rx="2.38" transform="translate(65.42 -21.21) rotate(45)"/>
        </g>
      </svg>
    );
    const { activeTab, project, projects } = this.props
    const { taskType } = this.state
    const isOwner = project.owner === userInfo.user.userId
    return (
      <Tabs defaultActiveKey={activeTab} activeKey={activeTab} onChange={this.switchTab} style={{ height: '100%' }} tabBarExtraContent={<UserInfoContainer/>} >
        <TabPane tab={<span><Icon component={LRSvg} size="small"/>首页</span>} key={HEAD.HOME} className="tab-container">
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
