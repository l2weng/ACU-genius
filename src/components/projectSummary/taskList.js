'use strict'

const React = require('react')
const { PureComponent } = React
const { Table } = require('antd')
const columns = [{
  title: '工作人员',
  dataIndex: 'name',
  render: text => <a href="javascript:;">{text}</a>,
}, {
  title: '总图片(张)',
  dataIndex: 'total',
}, {
  title: '已提交图片(张)',
  dataIndex: 'finished',
}, {
  title: '已审核图片(张)',
  dataIndex: 'reviewed',
}, {
  title: '类别',
  dataIndex: 'type',
}, {
  title: '截止日期',
  dataIndex: 'endTime',
}, {
  title: 'Action', dataIndex: '', key: 'x', render: () => <a href="javascript:;">审核</a>,
}]
const data = [{
  key: '1',
  name: 'John Brown',
  total: 3000,
  finished: 1600,
  reviewed: 588,
  type: '快消品',
  endTime: '11/12/2018',
}, {
  key: '2',
  name: 'Jim Green',
  total: 2000,
  finished: 800,
  reviewed: 300,
  type: 'Tesla',
  endTime: '12/01/2018',
}, {
  key: '3',
  name: 'Joe Black',
  total: 1800,
  finished: 900,
  reviewed: 80,
  type: '快速路',
  endTime: '12/19/2018',
}, {
  key: '4',
  name: 'Freedom Forever',
  total: 1700,
  finished: 888,
  reviewed: 139,
  type: '别墅',
  endTime: '12/31/2018',
}]

// rowSelection object indicates the need for row selection
const rowSelection = {
  onChange: (selectedRowKeys, selectedRows) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows)
  },
  getCheckboxProps: record => ({
    disabled: record.name === 'Disabled User', // Column configuration not to be checked
    name: record.name,
  }),
}

class TaskList extends PureComponent {
  componentDidMount() {

  }

  componentWillUnmount() {

  }
  render() {
    return (
      <div>
        <Table rowSelection={rowSelection} columns={columns} dataSource={data} />
      </div>
    )
  }
}

module.exports = { TaskList }
