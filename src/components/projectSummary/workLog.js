'use strict'

const React = require('react')
const { PureComponent } = React
const { array, object, bool, func } = require('prop-types')
const { Table } = require('antd')
const moment = require('moment-timezone')
const { FormattedMessage, intlShape, injectIntl } = require('react-intl')

const WorkLog = injectIntl(class extends PureComponent {

  static propTypes = {
    intl: intlShape.isRequired,
    logData: array.isRequired,
    pagination: object.isRequired,
    loading: bool.isRequired,
    onChange: func.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {

    const columns = [
      {
        title: this.props.intl.formatMessage({ id: 'summary.workLogs.assigner' }),
        dataIndex: 'userName',
        render: text => <a href="javascript:;">{text}</a>,
      }, {
        title: this.props.intl.formatMessage({ id: 'summary.workLogs.role' }),
        dataIndex: 'role',
        render: role => <div>{role === 0 ? this.props.intl.formatMessage({ id: 'contacts.friend' }) : this.props.intl.formatMessage({ id: 'contacts.colleague' })}</div>,
      }, {
        title: this.props.intl.formatMessage({ id: 'summary.workLogs.category.title' }),
        dataIndex: 'category',
        render: category => <div><FormattedMessage id={`summary.workLogs.category.c${category}`}/></div>,
      }, {
        title: this.props.intl.formatMessage({ id: 'summary.workLogs.event.title' }),
        dataIndex: 'type',
        render: type => <div><FormattedMessage id={`summary.workLogs.event.e${type}`}/></div>,
      }, {
        title: this.props.intl.formatMessage({ id: 'summary.workLogs.imageName' }),
        width: '20%',
        dataIndex: 'photoName',
      }, {
        title: this.props.intl.formatMessage({ id: 'summary.workLogs.labelsNumber' }),
        sorter: true,
        dataIndex: 'count',
      }, {
        title: this.props.intl.formatMessage({ id: 'summary.workLogs.spendTime' }),
        dataIndex: 'spendTime',
        render: spendTime=><div>{(spendTime / 1000).toFixed(2)}s</div>,
      }, {
        title: this.props.intl.formatMessage({ id: 'summary.workLogs.completionDate' }),
        dataIndex: 'finishedTime',
        render: finishedTime=><div>{moment(new Date(finishedTime)).tz(moment.tz.guess()).format('YYYY-MM-DD HH:mm:ss')}</div>,
      }
      // , {
      //   title: '操作',
      //   dataIndex: '',
      //   key: 'x',
      //   render: () => <a href="javascript:;">详情</a>,
      // }
    ]
    const { logData, pagination, loading, onChange } = this.props
    if (logData && logData.length > 0) {
      for (const oneLog of logData) {
        if (oneLog.hasOwnProperty('children') && oneLog.children.length === 0) {
          delete oneLog['children']
        }
      }
    }
    return (
      <div>
        <Table columns={columns} pagination={pagination} loading={loading} size="middle"
          rowKey={record => `${record.activityId}-${record.labelId}`} dataSource={logData}
          onChange={onChange}/>
      </div>
    )
  }
})

module.exports = { WorkLog }
