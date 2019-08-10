'use strict'

const React = require('react')
const { PureComponent } = React
const { Table } = require('antd')
const columns = [{
  title: '工作人员',
  dataIndex: 'name',
  render: text => <a href="javascript:;">{text}</a>,
}, {
  title: '角色',
  dataIndex: 'role',
}, {
  title: '类型',
  dataIndex: 'type',
}, {
  title: '图片地址',
  dataIndex: 'address',
}, {
  title: '标注数',
  dataIndex: 'labelCount',
}, {
  title: '耗时',
  dataIndex: 'spendTime',
}, {
  title: '完成日期',
  dataIndex: 'endTime',
}, {
  title: '操作', dataIndex: '', key: 'x', render: () => <a href="javascript:;">详情</a>,
}]
const data = [{
  key: '1',
  name: '韦伯',
  role: '员工',
  type: '图片',
  address: 'DSC_7897',
  labelCount: 6,
  spendTime: '180s',
  endTime: '11/12/2018',
}, {
  key: '2',
  name: '小陈',
  role: '员工',
  type: '图片',
  address: 'DSC_7888',
  labelCount: 7,
  spendTime: '180s',
  endTime: '11/12/2018',
}, {
  key: '3',
  name: 'Lynn',
  role: '员工',
  type: '图片',
  address: 'DSC_7899',
  labelCount: 30,
  spendTime: '214s',
  endTime: '11/12/2018',
}, {
  key: '4',
  name: 'Freedom Forever',
  role: 'Vendor',
  type: '图片',
  address: 'DSC_7908',
  labelCount: 44,
  spendTime: '1888s',
  endTime: '11/13/2018',
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

class WorkLog extends PureComponent {

  render() {
    return (
      <div>
        <Table rowSelection={rowSelection} columns={columns} dataSource={data} />
      </div>
    )
  }
}

module.exports = { WorkLog }
