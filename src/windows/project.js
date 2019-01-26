'use strict'

const { all } = require('../common/promisify')
const React = require('react')
const { render } = require('react-dom')
const { ready, $ } = require('../dom')
const { create } = require('../stores/project')
const { Main } = require('../components/main')
const { ProjectContainer } = require('../components/project')
const { UserInfoContainer } = require('../components/user')
const { main } = require('../sagas/project')
const { win } = require('../window')
const act = require('../actions')
const dialog = require('../dialog')
const { Tabs, Icon } = require('antd')
const TabPane = Tabs.TabPane
const store = create()
const tasks = store.saga.run(main)
const { Contacts } = require('../components/contacts')
const { Workplace } = require('../components/workplace')

const { locale, file } = ARGS

all([
  store.dispatch(act.intl.load({ locale })),
  store.dispatch(act.keymap.load({ name: 'project', locale })),
  ready
])
  .then(() => {
    store.dispatch(act.project.open(file))

    render(
      <Main store={store}>
        <Tabs defaultActiveKey="3" style={{ height: '100%' }} tabBarExtraContent={<UserInfoContainer/>} >
          <TabPane tab={<span><Icon type="home" size="small"/>首页</span>} key="1" className="workplace">
            <Workplace/>
          </TabPane>
          <TabPane tab={<span><Icon type="project" size="small"/>项目</span>} key="2"><ProjectContainer showProject={false}/></TabPane>
          <TabPane tab={<span><Icon type="form" size="small"/>工作台</span>} key="3" ><ProjectContainer showProject/></TabPane>
          <TabPane tab={<span><Icon type="contacts" size="small"/>联系人</span>}  key="4"><Contacts/></TabPane>
        </Tabs>
      </Main>,
      $('main')
    )
  })

dialog.start(store)

win.on('app.undo', () => {
  store.dispatch(act.history.undo())
})
win.on('app.redo', () => {
  store.dispatch(act.history.redo())
})
win.on('settings.update', (settings) => {
  store.dispatch(act.settings.update(settings))
  if (settings.locale) {
    store.dispatch(act.intl.load({ locale: settings.locale }))
  }
})

win.unloaders.push(dialog.stop)
win.unloaders.push(() => (
  store.dispatch(act.project.close()), tasks.done
))

Object.defineProperty(window, 'store', { get: () => store })
Object.defineProperty(window, 'state', { get: () => store.getState() })
