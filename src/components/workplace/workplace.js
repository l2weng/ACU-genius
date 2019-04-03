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
const { HEAD } = require('../../constants')
const { resolve, join } = require('path')
const staticRoot = resolve(__dirname, '../../../', 'static')
const defaultCover = join(staticRoot, 'images/project', 'default-cover.jpg')
const { TasksTable } = require('./taskTable')

const {
  getCachePrefix,
} = require('../../selectors')
class Workplace extends PureComponent {

  constructor(props) {
    super(props)
  }

  openProject = (path) => {
    this.props.switchTab(HEAD.WORKSPACE)
    this.props.onProjectOpen(path)
  }

  componentDidMount() {
    if (!_.isEmpty(userInfo)) {
      this.props.fetchProjects(true, userInfo.user.userId)
      this.props.fetchTasks(userInfo.user.userId)
    } else if (!_.isEmpty(machineId)) {
      this.props.fetchProjects(false, machineId)
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.project.id !== this.props.project.id) {
      this.props.switchTab(HEAD.WORKSPACE)
    }
  }

  renderTitle(item) {
    let cloudMark = ''
    if (item.syncStatus) {
      cloudMark = <Icon type="cloud" theme="twoTone" twoToneColor="#52c41a" style={{ float: 'right' }}/>
    } else {
      cloudMark = <Icon type="cluster" style={{ float: 'right' }}/>
    }
    return (<div><a onClick={()=>this.openProject(
      item.projectFile)}>{item.name}</a>{cloudMark}</div>)
  }


  getCacheCover = (cover) => {
    return cover ? cover : defaultCover
  }

  render() {
    const { projects, tasks } = this.props

    return (
      <div>
        <Row gutter={24}>
          <Col span={24}>
            <Card
              bordered={false}
              title="进行中的项目"
              extra={<a href="#">全部项目</a>}>
              <List
                rowKey="id"
                loading={false}
                grid={{ gutter: 24, lg: 6, md: 3, sm: 2, xs: 1 }}
                dataSource={[...projects]}
                renderItem={item =>
                  <List.Item key={item.projectId}>
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
                  </List.Item>
                }/>
            </Card>
            <Card
              bordered={false}
              title="进行中的任务"
              extra={
                <div>
                  <RadioGroup defaultValue="all">
                    <RadioButton value="all">我的任务</RadioButton>
                    <RadioButton value="progress">参与的任务</RadioButton>
                  </RadioGroup>
                  <Search className="extraContentSearch" placeholder="请输入" onSearch={() => ({})} />
                </div>
              }>
              <TasksTable tasks={tasks}/>
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
    cache: string,
    project: object,
    projects: array,
    tasks: array,
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
      onProjectOpen(path) {
        dispatch(actions.project.open(path))
      },
      fetchProjects(typeFlag = false, id) {
        dispatch(actions.header.loadProjects({ typeFlag, id }))
      },
      fetchTasks(userId) {
        dispatch(actions.header.loadMyTasks({ userId }))
      },
      fetchSelections(userId) {
        dispatch(actions.header.loadMyTasks({ userId }))
      }
    }),
  )(Workplace),
}
