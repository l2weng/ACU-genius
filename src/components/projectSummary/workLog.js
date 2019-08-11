'use strict'

const React = require('react')
const { PureComponent } = React
const { array } = require('prop-types')
const { Table } = require('antd')
const columns = [{
  title: '工作人员',
  dataIndex: 'userName',
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
  dataIndex: 'count',
}, {
  title: '耗时',
  dataIndex: 'spendTime',
}, {
  title: '完成日期',
  dataIndex: 'finishedTime',
}, {
  title: '操作', dataIndex: '', key: 'x', render: () => <a href="javascript:;">详情</a>,
}]

class WorkLog extends PureComponent {

  constructor(props) {
    super(props)
    this.state = {
    }
  }

  render() {
    const { logData } = this.props
    console.log(logData)
    return (
      <div>
        <Table columns={columns} dataSource={logData} />
      </div>
    )
  }
  static propTypes = {
    logData: array.isRequired,
  }
}

module.exports = { WorkLog }
