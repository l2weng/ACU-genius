'use strict'

const React = require('react')
const { Table, Input, Button, Icon } = require('antd')
const Highlighter = require('react-highlight-words')
const { array } = require('prop-types')

class TasksTable extends React.Component {
  state = {
    searchText: '',
  }

  getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
                       setSelectedKeys, selectedKeys, confirm, clearFilters,
                     }) => (
                       <div style={{ padding: 8 }}>
                         <Input
                           ref={node => { this.searchInput = node }}
                           placeholder={`Search ${dataIndex}`}
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
    onFilter: (value, record) => record[dataIndex].toString()
      .toLowerCase()
      .includes(value.toLowerCase()),
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

  render() {
    const columns = [
      {
        key: '1',
        title: '名称',
        dataIndex: 'name',
        width: '25%',
        ...this.getColumnSearchProps('name'),
      }, {
        title: '项目',
        dataIndex: 'project.name',
        key: '2',
        width: '25%',
        ...this.getColumnSearchProps('email'),
      }, {
        title: '进度',
        dataIndex: 'progress',
        key: '3',
        width: '15%',
      }, {
        title: '类型',
        dataIndex: 'type',
        key: '4',
        width: '15%',
      }, {
        title: '操作',
        key: 'action',
        width: '10%',
        render: (text, record) => (
          <span>
            <a href="javascript:;">查看</a>
          </span>
        ),
      }]
    return <Table columns={columns} dataSource={this.props.tasks}/>
  }
  static propTypes = {
    tasks: array.isRequired,
  }
}

module.exports = {
  TasksTable,
}