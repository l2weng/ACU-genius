'use strict'

const React = require('react')
const { PureComponent } = React
const { Table } = require('antd')
const { array } = require('prop-types')
const uuid = require('uuid/v4')
const columns = [
  {
    title: '工作人员',
    dataIndex: 'name',
    render: name => <a href="javascript:;">{name}</a>,
  }, {
    title: '总图片(张)',
    dataIndex: 'total',
  }, {
    title: '已提交图片(张)',
    dataIndex: 'submmitted',
  }, {
    title: '剩余(张)',
    dataIndex: 'open',
  },{
    title: '完成率',
    dataIndex: 'procentage',
    render: procentage => <div>{procentage}%</div>,
  }, {
    title: '截止日期',
    dataIndex: 'endTime',
  }, {
    title: '操作',
    dataIndex: '',
    key: 'x',
    render: () => <a href="javascript:;">详情</a>,
  },
]

class TaskList extends PureComponent {
  static propTypes = {
    userPhotoStatusData: array.isRequired,
  }

  render() {
    const { userPhotoStatusData } = this.props
    return (
      <div>
        <Table rowKey={uuid()} columns={columns}
          dataSource={userPhotoStatusData}/>
      </div>
    )
  }
}

module.exports = { TaskList }
