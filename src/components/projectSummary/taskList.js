'use strict'

const React = require('react')
const { PureComponent } = React
const { Table } = require('antd')
const { array } = require('prop-types')
const uuid = require('uuid/v4')
const { FormattedMessage, intlShape, injectIntl } = require('react-intl')

const TaskList = injectIntl(class extends PureComponent {

  static propTypes = {
    intl: intlShape.isRequired,
    userPhotoStatusData: array.isRequired,
  }

  render() {

    const columns = [
      {
        title: this.props.intl.formatMessage({ id: 'summary.task.assigner' }),
        dataIndex: 'name',
        render: name => <a href="javascript:;">{name}</a>,
      }, {
        title: this.props.intl.formatMessage({ id: 'summary.task.totalPicture' }),
        dataIndex: 'total',
      }, {
        title: this.props.intl.formatMessage({ id: 'summary.task.submittedImage' }),
        dataIndex: 'submitted',
      }, {
        title: this.props.intl.formatMessage({ id: 'summary.task.remaining' }),
        dataIndex: 'open',
      }, {
        title: this.props.intl.formatMessage({ id: 'summary.task.completionRate' }),
        dataIndex: 'percentage',
        render: percentage => <div>{percentage}%</div>,
      },
      // {
      //   title: '截止日期',
      //   dataIndex: 'endTime',
      // },
      {
        title: this.props.intl.formatMessage({ id: 'summary.task.action' }),
        dataIndex: '',
        key: 'x',
        render: () => <a href="javascript:;"><FormattedMessage id="summary.task.details"/></a>,
      },
    ]
    const { userPhotoStatusData } = this.props
    return (
      <div>
        <Table rowKey={uuid()} size="middle" columns={columns} locale={{ emptyText: this.props.intl.formatMessage({ id: 'summary.noTaskResources' }) }}
          dataSource={userPhotoStatusData}/>
      </div>
    )
  }
})

module.exports = { TaskList }
