'use strict'

const React = require('react')
const { Table, Input, Button, Icon } = require('antd')
const Highlighter = require('react-highlight-words')
const { array, func } = require('prop-types')

class ColleagueTable extends React.Component {
  state = {
    searchText: '',
    selectedUserIds: this.props.defaultIdx,
    loading: false,
  }

  componentDidMount = () =>{
  }

  getColumnSearchProps = (dataIndex) => ({
    filterDropdown:
      ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
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

  assignWork = () => {
    this.props.handleAssign(this.state.selectedUserIds)
  };

  handleReset = (clearFilters) => {
    clearFilters()
    this.setState({ searchText: '' })
  }

  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedUserIds: selectedRowKeys })
  }

  pickUser = (userId) =>{
    this.props.handleAssign([userId])
  }

  render() {
    const columns = [
      {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
        width: '35%',
        ...this.getColumnSearchProps('name'),
      }, {
        title: '邮箱',
        dataIndex: 'email',
        key: 'email',
        width: '35%',
        ...this.getColumnSearchProps('email'),
      }, {
        title: '级别',
        key: 'level',
        width: '15%',
      }, {
        title: '操作',
        key: 'action',
        width: '15%',
        render: (text, record) => (
          <span>
            <a href="javascript:;" onClick={()=>(this.pickUser(record.userId))}>分配</a>
          </span>
        ),
      }]
    const { loading, selectedUserIds } = this.state
    const rowSelection = {
      selectedRowKeys: selectedUserIds,
      onChange: this.onSelectChange,
    }
    const hasSelected = selectedUserIds.length > 0
    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          {/*<Button*/}
          {/*  type="primary"*/}
          {/*  onClick={this.assignWork}*/}
          {/*  disabled={!hasSelected}*/}
          {/*  loading={loading}>*/}
          {/*分配*/}
          {/*</Button>*/}
          {/*<span style={{ marginLeft: 8 }}>*/}
          {/*  {hasSelected ? `Selected ${selectedUserIds.length} users` : ''}*/}
          {/*</span>*/}
        </div>
        <Table columns={columns} rowKey={record=>record.userId} dataSource={this.props.data}/>
      </div>
    )
  }
  static propTypes = {
    data: array.isRequired,
    handleAssign: func.isRequired,
    defaultIdx: array.isRequired
  }
}


module.exports = { ColleagueTable }

// rowSelection={rowSelection}
