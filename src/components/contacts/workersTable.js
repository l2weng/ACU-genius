'use strict'

const React = require('react')
const { PureComponent } = React
const { Table, Input, Button, Icon, message } = require('antd')
const Highlighter = require('react-highlight-words')
const { FormattedMessage, intlShape, injectIntl } = require('react-intl')
const { array, func } = require('prop-types')
const axios = require('axios')
const { userInfo } = ARGS

const WorkersTable = injectIntl(class extends PureComponent {
  state = {
    searchText: '',
  }

  placeholder = (dataIndex) => {
    return `${this.props.intl.formatMessage({ id: 'common.search' })}${this.props.intl.formatMessage({ id: `contacts.form.${dataIndex}` })}`
  }

  getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => { this.searchInput = node }}
          placeholder={this.placeholder(dataIndex)}
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
          <FormattedMessage id="common.search"/>
        </Button>
        <Button
          onClick={() => this.handleReset(clearFilters)}
          size="small"
          style={{ width: 90 }}>
          <FormattedMessage id="common.reset"/>
        </Button>
      </div>
    ),
    filterIcon: filtered => <Icon type="search" style={{
      color: filtered
        ? '#1890ff'
        : undefined,
    }}/>,
    onFilter: (value, record) => record[dataIndex] ? record[dataIndex].toString() : ''
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

  inviteFriend = (userId, name) => {
    axios.post(`${ARGS.apiServer}/messages/inviteFriend`, {
      createdBy: userInfo.user.userId,
      createdByName: userInfo.user.name,
      userId: userId,
      invited: name,
      title: this.props.intl.formatMessage({ id: 'contacts.invitation.title' }),
      content: `${userInfo.user.name} ${this.props.intl.formatMessage({ id: 'contacts.invitation.content' })}`,
    }).then(res=>{
      if (res.data) {
        message.success(this.props.intl.formatMessage({ id: 'contacts.invitation.success' }))
      } else {
        message.error(this.props.intl.formatMessage({ id: 'common.error' }))
      }
    })
  }

  render() {
    const columns = [
      {
        title: this.props.intl.formatMessage({ id: 'contacts.form.name' }),
        dataIndex: 'name',
        key: 'name',
        width: '20%',
        ...this.getColumnSearchProps('name'),
      }, {
        title: this.props.intl.formatMessage({ id: 'contacts.form.email' }),
        dataIndex: 'email',
        key: 'email',
        width: '35%',
        ...this.getColumnSearchProps('email'),
      }, {
        title: this.props.intl.formatMessage({ id: 'contacts.form.action' }),
        key: 'action',
        width: '15%',
        render: (text, record) => (
          <span>
            <a href="javascript:;" onClick={()=>this.inviteFriend(record.userId, record.name)}><FormattedMessage id="contacts.form.invite"/></a>
          </span>
        ),
      }]
    return <Table columns={columns} rowKey={record=>record.userId} dataSource={this.props.data}/>
  }
  static propTypes = {
    intl: intlShape.isRequired,
    data: array.isRequired,
    onInvited: func.isRequired
  }
})

module.exports = {
  WorkersTable,
}
