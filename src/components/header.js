'use strict'

const React = require('react')
const { connect } = require('react-redux')
const { UserInfoContainer } = require('../components/user')
const { Tabs, Icon } = require('antd')
const TabPane = Tabs.TabPane
const { ProjectContainer } = require('../components/project')
const { Contacts } = require('../components/contacts')
const { Workplace } = require('../components/workplace')
const actions = require('../actions')
const { HEAD } = require('../constants')

const {
   func, object
} = require('prop-types')

class Header extends React.Component {

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    if (this.props.activeTab === undefined) {
      this.switchTab(HEAD.HOME)
    }
  }

  switchTab = (tabName) => {
    this.props.switchTab(tabName)
  }

  render() {
    let { activeTab } = this.props
    return (
      <Tabs defaultActiveKey={activeTab} activeKey={activeTab} onChange={this.switchTab} style={{ height: '100%' }} tabBarExtraContent={<UserInfoContainer/>} >
        <TabPane tab={<span><Icon type="home" size="small"/>首页</span>} key={HEAD.HOME} className="workplace">
          <Workplace switchTab={this.switchTab}/>
        </TabPane>
        <TabPane tab={<span><Icon type="project" size="small"/>项目</span>} key={HEAD.PROJECT}><ProjectContainer showProject={false}/></TabPane>
        <TabPane tab={<span><Icon type="form" size="small"/>工作台</span>} key={HEAD.WORKSPACE} ><ProjectContainer showProject/></TabPane>
        <TabPane tab={<span><Icon type="contacts" size="small"/>联系人</span>}  key={HEAD.FRIENDS}><Contacts/></TabPane>
      </Tabs>
    )
  }

  static propTypes = {
    activeTab: object,
    switchTab: func,
    fetchProjects: func.isRequired,
  }
}

module.exports = {
  Header: connect(
    state => ({
      activeTab: state.header.activeTab
    }),
    dispatch => ({
      switchTab(tabName) {
        dispatch(actions.header.headerSwitch({ activeTab: tabName }))
      }
    }),
  )(Header),
}
