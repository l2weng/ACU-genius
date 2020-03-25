'use strict'

const React = require('react')
const { Table, Input, Button, Icon, Badge, Divider, Popconfirm } = require('antd')
const Highlighter = require('react-highlight-words')
const { array, func, number } = require('prop-types')
const { HEAD, LIST } = require('../../constants')
const { getTaskStatusBadge } = require('../../common/dataUtil')
const { FormattedMessage, intlShape, injectIntl } = require('react-intl')
const moment = require('moment')

const TasksTable = injectIntl(class extends React.Component {
  state = {
    searchText: '',
  }

  placeholder = (dataIndex) => {
    return this.props.intl.formatMessage({ id: `home.task.${dataIndex}` })
  }

  getColumnSearchProps = (dataIndex, subIndex = '') => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => { this.searchInput = node }}
          placeholder={this.placeholder(dataIndex)}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}/>
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm)}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}>
          <FormattedMessage id="home.task.search"/>
        </Button>
        <Button
          onClick={() => this.handleReset(clearFilters)}
          size="small"
          style={{ width: 90 }}>
          <FormattedMessage id="home.task.reset"/>
        </Button>
      </div>
    ),
    filterIcon: filtered => <Icon type="search" style={{
      color: filtered
        ? '#1890ff'
        : undefined,
    }}/>,
    onFilter: (value, record) => {
      if (subIndex !== '') {
        return record[dataIndex][subIndex].toString().toLowerCase().includes(value.toLowerCase())
      } else {
        return record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
      }
    },
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => this.searchInput.select())
      }
    },
    render: (text) => (
      <Highlighter
        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
        searchWords={[this.state.searchText]}
        autoEscape
        textToHighlight={text ? text.toString() : ''}/>
    ),
  })

  handleSearch = (selectedKeys, confirm) => {
    confirm()
    this.setState({ searchText: selectedKeys[0] })
  }

  handleReset = (clearFilters) => {
    clearFilters()
    this.setState({ searchText: '' })
  }

  checkProject = (projectId)=>{
    this.props.openProjectById(projectId)
  }

  auditTask = (task)=>{
    this.props.onPassTask(task)
  }

  rollbackTask = (task)=>{
    this.props.onRollbackTask(task)
  }

  submitTask = (task)=>{
    if (task.isOwner) {
      this.props.onPassTask(task)
    } else {
      this.props.onSubmitTask(task)
    }
  }

  getTaskStatusDesc(status = 0) {
    return this.props.intl.formatMessage({ id: `home.task.status${status}` })
  }

  render() {
    const { tasks } = this.props
    const columns = [
      {
        key: 'name',
        title: <FormattedMessage id="home.task.name"/>,
        dataIndex: 'name',
        width: '20%',
        ...this.getColumnSearchProps('name'),
        render: (text, record) => (
          <div><a href="javascript:;" onClick={()=>this.checkProject(record.project.projectId)}>{record.name}</a></div>
        ),
      }, {
        title: <FormattedMessage id="home.task.project"/>,
        dataIndex: 'project.name',
        key: 'project.name',
        width: '20%',
        ...this.getColumnSearchProps('project', 'name'),
      },  {
        title: <FormattedMessage id="home.task.status"/>,
        dataIndex: 'workStatus',
        key: 'workStatus',
        width: '15%',
        filters: [
          {
            text: this.getTaskStatusDesc(0),
            value: 0,
          },
          {
            text: this.getTaskStatusDesc(1),
            value: 1,
          },
          {
            text: this.getTaskStatusDesc(2),
            value: 2,
          },
          {
            text: this.getTaskStatusDesc(3),
            value: 3,
          }],
        onFilter: (value, record) => record.workStatus === value,
        render: (text, record) => (
          <div><Badge status={getTaskStatusBadge(record.workStatus)} text={this.getTaskStatusDesc(record.workStatus)} /></div>
        ),
      }, {
        title: <FormattedMessage id="home.task.createdAt"/>,
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: '15%',
        render: (text, record) => (
          <div>{moment(new Date(record.createdAt)).format('YYYY-MM-DD HH:mm:ss')}</div>
        ),
      }, {
        title: <FormattedMessage id="home.task.action"/>,
        key: 'action',
        width: '20%',
        render: (text, record) => (
          <span>
            {record.category === HEAD.MY_TASKS ? <span>
              <Popconfirm placement="top" title={this.props.intl.formatMessage({ id: 'home.task.confirm' })} onConfirm={()=>this.auditTask(record)} okText={this.props.intl.formatMessage({ id: 'common.ok' })} cancelText={this.props.intl.formatMessage({ id: 'common.cancel' })}>
                <Button size="small" disabled={record.workStatus === 3}><FormattedMessage id="home.task.confirm"/></Button>
                <Divider type="vertical" />
              </Popconfirm>
              <Popconfirm placement="top" title={this.props.intl.formatMessage({ id: 'home.task.withdraw' })} onConfirm={()=>this.rollbackTask(record)} okText={this.props.intl.formatMessage({ id: 'common.ok' })} cancelText={this.props.intl.formatMessage({ id: 'common.cancel' })}>
                <Button size="small" disabled={record.workStatus !== 3}><FormattedMessage id="home.task.withdraw"/></Button>
                <Divider type="vertical" />
              </Popconfirm>
            </span> : ''}
            {record.category === HEAD.JOINED_TASKS ? <Popconfirm placement="top" title={this.props.intl.formatMessage({ id: 'home.task.submit' })} onConfirm={()=>this.submitTask(record)} okText={this.props.intl.formatMessage({ id: 'common.ok' })} cancelText={this.props.intl.formatMessage({ id: 'common.cancel' })}>
              {record.workStatus === 0 || record.workStatus === 1 ? <span>
                <Button size="small"><FormattedMessage id="home.task.submit"/></Button>
                <Divider type="vertical" /></span>
                : ''}
            </Popconfirm> : ''}
            <a href="javascript:;" onClick={()=>this.checkProject(record.project.projectId)}><FormattedMessage id="home.task.details"/></a>
          </span>
        ),
      }]
    return <Table columns={columns} rowkey={record=>record.taskId} dataSource={tasks}/>
  }
  static propTypes = {
    intl: intlShape.isRequired,
    tasks: array.isRequired,
    openProjectById: func.isRequired,
    onPassTask: func.isRequired,
    onRollbackTask: func.isRequired,
    onSubmitTask: func.isRequired,
    taskType: number.isRequired
  }
})

module.exports = {
  TasksTable,
}
