'use strict'

const React = require('react')
const { PureComponent } = React
const { connect } = require('react-redux')
const { Row, Col, Card, List, Table, Divider, Tag, message } = require('antd')
const { Meta } = Card
const _ = require('underscore')
const { userInfo, machineId } = ARGS
const actions = require('../../actions')
const { func, object, array  } = require('prop-types')
const { HEAD } = require('../../constants')
const { resolve, join } = require('path')
const staticRoot = resolve(__dirname, '../../../', 'static')
const defaultCover = join(staticRoot, 'images/project', 'default-cover.jpg')

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
    } else if (!_.isEmpty(machineId)) {
      this.props.fetchProjects(false, machineId)
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.project.id !== this.props.project.id) {
      this.props.switchTab(HEAD.WORKSPACE)
    }
  }

  componentWillReceiveProps(props) {
    console.log(props)
  }

  render() {
    const { projects } = this.props
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: text => <a href="javascript:;">{text}</a>,
      }, {
        title: 'Age',
        dataIndex: 'age',
        key: 'age',
      }, {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
      }, {
        title: 'Tags',
        key: 'tags',
        dataIndex: 'tags',
        render: tags => (
          <span>
            {tags.map(tag => <Tag color="blue" key={tag}>{tag}</Tag>)}
          </span>
        ),
      }, {
        title: 'Action',
        key: 'action',
        render: (text, record) => (
          <span>
            <a href="javascript:;">Invite {record.name}</a>
            <Divider type="vertical"/>
            <a href="javascript:;">Delete</a>
          </span>
        ),
      }]

    const data = [
      {
        key: '1',
        name: 'John Brown',
        age: 32,
        address: 'New York No. 1 Lake Park',
        tags: ['nice', 'developer'],
      }, {
        key: '2',
        name: 'Jim Green',
        age: 42,
        address: 'London No. 1 Lake Park',
        tags: ['loser'],
      }, {
        key: '3',
        name: 'Joe Black',
        age: 32,
        address: 'Sidney No. 1 Lake Park',
        tags: ['cool', 'teacher'],
      }]

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
                      style={{ width: 180 }}
                      cover={<img alt={item.name}
                        src={item.cover ? item.cover : defaultCover}/>}>
                      <Meta
                        title={<a onClick={()=>this.openProject(
                          item.projectFile)}>{item.name}</a>}
                        description={item.name}/>
                    </Card>
                  </List.Item>
                }/>
            </Card>
            <Card
              bordered={false}
              title="进行中的任务"
              extra={<a href="#">全部任务</a>}>
              <Table columns={columns} dataSource={data}/>
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
    project: object,
    projects: array,
  }
}

module.exports = {
  Workplace: connect(
    state => ({
      project: state.project,
      projects: state.header.projects
    }),
    dispatch => ({
      onProjectOpen(path) {
        dispatch(actions.project.open(path))
      },
      fetchProjects(typeFlag = false, id) {
        dispatch(actions.header.loadProjects({ typeFlag, id }))
      }
    }),
  )(Workplace),
}
