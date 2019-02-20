'use strict'

const React = require('react')
const { UserInfoContainer } = require('../components/user')
const { Tabs, Icon } = require('antd')
const TabPane = Tabs.TabPane
const { ProjectContainer } = require('../components/project')
const { Contacts } = require('../components/contacts')
const { Workplace } = require('../components/workplace')
const { HEAD } = require('../constants')

class TabContainer extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      activeKey: HEAD.HOME,
    }
  }

  switchTab = (tabName) => {
    this.setState({ activeKey: tabName })
  }

  render() {
    return (
      <Tabs activeKey={this.state.activeKey} onChange={this.switchTab} style={{ height: '100%' }} tabBarExtraContent={<UserInfoContainer/>} >
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
  }
}

module.exports = { TabContainer }
