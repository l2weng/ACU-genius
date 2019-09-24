'use strict'

const React = require('react')
const { Table, Input, Button, Icon, Badge, Divider, Popconfirm } = require('antd')
const Highlighter = require('react-highlight-words')
const { array, func, number } = require('prop-types')
const { HEAD } = require('../../constants')
const { getTaskStatusDesc, getTaskStatusBadge } = require('../../common/dataUtil')
const { FormattedMessage } = require('react-intl')

class TasksTable extends React.Component {
  state = {
    searchText: '',
  }

  getColumnSearchProps = (dataIndex, subIndex = '') => ({
    filterDropdown: ({
                       setSelectedKeys, selectedKeys, confirm, clearFilters,
                     }) => (
                       <div style={{ padding: 8 }}>
                         <Input
                           ref={node => { this.searchInput = node }}
                           placeholder={`Search ${dataIndex} ${subIndex}`}
                           value={selectedKeys[0]}
                           onChange={e => setSelectedKeys(
            e.target.value ? [e.target.value] : [])}
                           onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
                           style={{ width: 188, marginBottom: 8, display: 'block' }}/>
                         <Button
                           type="primary"
                           onClick={() => this.handleSearch(selectedKeys, confirm)}
                           icon="search"
                           size="small"
                           style={{ width: 90, marginRight: 8 }}>
          Search
                         </Button>
                         <Button
                           onClick={() => this.handleReset(clearFilters)}
                           size="small"
                           style={{ width: 90 }}>
          Reset
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
        textToHighlight={text.toString()}/>
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
    this.props.onSubmitTask(task)
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
      }, {
        title: <FormattedMessage id="home.task.project"/>,
        dataIndex: 'project.name',
        key: 'project.name',
        width: '20%',
        ...this.getColumnSearchProps('project', 'name'),
      }, {
        title: <FormattedMessage id="home.task.progress"/>,
        dataIndex: 'progress',
        key: 'progress',
        width: '15%',
      }, {
        title: <FormattedMessage id="home.task.status"/>,
        dataIndex: 'workStatus',
        key: 'workStatus',
        width: '15%',
        filters: [
          {
            text: getTaskStatusDesc(0),
            value: 0,
          },
          {
            text: getTaskStatusDesc(1),
            value: 1,
          },
          {
            text: getTaskStatusDesc(2),
            value: 2,
          },
          {
            text: getTaskStatusDesc(3),
            value: 3,
          }],
        onFilter: (value, record) => record.workStatus === value,
        render: (text, record) => (
          <div><Badge status={getTaskStatusBadge(record.workStatus)} text={getTaskStatusDesc(record.workStatus)} /></div>
        ),
      }, {
        title: <FormattedMessage id="home.task.action"/>,
        key: 'action',
        width: '20%',
        render: (text, record) => (
          <span>
            {record.category === HEAD.MY_TASKS ? <span>
              <Popconfirm placement="top" title={'审核任务'} onConfirm={()=>this.auditTask(record)} okText="通过" cancelText="取消">
                <a href="javascript:">审核</a>
                <Divider type="vertical" />
              </Popconfirm>
              <Popconfirm placement="top" title={'撤回任务'} onConfirm={()=>this.rollbackTask(record)} okText="撤回" cancelText="取消">
                <a href="javascript:">撤回</a>
                <Divider type="vertical" />
              </Popconfirm>
            </span> : ''}
            {record.category === HEAD.JOINED_TASKS ? <Popconfirm placement="top" title={'提交任务'} onConfirm={()=>this.submitTask(record)} okText="确认" cancelText="取消">
              {record.workStatus === 0 || record.workStatus === 1 ? <span><a href="javascript:">提交</a>             <Divider type="vertical" /></span>
                : ''}
            </Popconfirm> : ''}
            <a href="javascript:" onClick={()=>this.checkProject(record.project.projectId)}>查看</a>
          </span>
        ),
      }]
    return <Table columns={columns} rowkey={record=>record.taskId} dataSource={tasks}/>
  }
  static propTypes = {
    tasks: array.isRequired,
    openProjectById: func.isRequired,
    onPassTask: func.isRequired,
    onRollbackTask: func.isRequired,
    onSubmitTask: func.isRequired,
    taskType: number.isRequired
  }
}

module.exports = {
  TasksTable,
}
