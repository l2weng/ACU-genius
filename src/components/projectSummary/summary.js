'use strict'

const React = require('react')
const { PureComponent } = React
const { Row, Col, Radio } = require('antd')
const { Chart, Geom, Axis, Tooltip, Coord } = require('bizcharts')
const { array, string, object, func } = require('prop-types')
const { FormattedMessage, intlShape, injectIntl } = require('react-intl')
const moment = require('moment-timezone')

const Summary = injectIntl(class extends PureComponent {

  render() {
    const cols = {
      value: { min: 0 },
      year: { range: [0, 1] }
    }
    const { skuData, taskStatuses, activityData, userPhotoStatusData, activityType } = this.props
    return (
      <div className="project-summary">
        <Row gutter={24}>
          <Col span={12}>
            <div>
              <div className="title"><FormattedMessage id="summary.projectProgress"/>: </div>
              <div className="details">
                <div className="summary-progress"><div className="label">{taskStatuses.submitted}</div><div className="val"><FormattedMessage id="summary.submitted"/></div></div>
                <div className="summary-progress"><div className="label">{taskStatuses.open}</div><div className="val"><FormattedMessage id="summary.remaining"/></div></div>
                <div className="summary-progress"><div className="label">{taskStatuses.skipped}</div><div className="val"><FormattedMessage id="summary.skipped"/></div></div>
                <div className="summary-progress"><div className="label">{taskStatuses.progress}%</div><div className="val"><FormattedMessage id="summary.completed"/></div></div>
              </div>
            </div>
            <div style={{ paddingTop: '24px' }}>
              <div style={{ paddingBottom: '5px', float: 'right' }}>
                <Radio.Group defaultValue="HH" size="small" onChange={this.props.switchActivityData}>
                  <Radio.Button value="HH"><FormattedMessage id="summary.activity.lastHour"/></Radio.Button>
                  <Radio.Button value="DD"><FormattedMessage id="summary.activity.today"/></Radio.Button>
                  <Radio.Button value="7D"><FormattedMessage id="summary.activity.last7days"/></Radio.Button>
                  <Radio.Button value="MM"><FormattedMessage id="summary.activity.month"/></Radio.Button>
                  <Radio.Button value="YY"><FormattedMessage id="summary.activity.year"/></Radio.Button>
                </Radio.Group>
              </div>
              <div className="title"><FormattedMessage id="summary.activity.title"/>:</div>
              <Chart height={400} data={activityData} scale={cols} forceFit placeholder={this.props.intl.formatMessage({ id: 'common.noData' })}>
                <Axis name="Time" label={{ formatter(text, item, index) {
                  if (activityType === 'HH') {
                    return moment(text).tz(moment.tz.guess()).format('HH:mm:ss')
                  } else if (activityType === 'DD') {
                    return moment(text).tz(moment.tz.guess()).format('YYYY-MM-DD HH:mm:ss')
                  } else {
                    return text
                  }
                } }}/>
                <Axis name="SumCount" />
                <Tooltip crosshairs={{ type: 'y' }}/>
                <Geom type="line" position="Time*SumCount" size={2} />
                <Geom type="point" position="Time*SumCount" size={4} shape={'circle'} style={{ stroke: '#fff', lineWidth: 1 }} />
              </Chart>
            </div>
          </Col>
          <Col span={12}>
            <div>
              <div className="title"><FormattedMessage id="summary.targets"/>: </div>
              <Chart height={300} data={skuData} forceFit placeholder={this.props.intl.formatMessage({ id: 'common.noData' })}>
                <Coord transpose />
                <Axis name="name" label={{ offset: 12 }} />
                <Axis name="count" />
                <Tooltip />
                <Geom type="interval" color={['color', (color)=>{
                  return color
                }]}
                  tooltip={['name*count', (name, count)=>{
                    return {
                      name: `${this.props.intl.formatMessage({ id: 'summary.task.targetCount' })}:  ${count}`
                    }
                  }]}
                  position="name*count" />
              </Chart>
            </div>
            <div>
              <div className="title"><FormattedMessage id="summary.taskCompletionRate"/>: </div>
              <Chart height={300} data={userPhotoStatusData} forceFit placeholder={this.props.intl.formatMessage({ id: 'common.noData' })}>
                <Coord transpose />
                <Axis name="name" label={{ offset: 12 }} />
                <Axis name="percentage"/>
                <Tooltip />
                <Geom type="interval"  position="name*percentage"
                  tooltip={['name*percentage', (name, percentage)=>{
                    return {
                      name: `${this.props.intl.formatMessage({ id: 'summary.task.completionRate' })}: ${percentage}%`
                    }
                  }]}/>
              </Chart>
            </div>
          </Col>
        </Row>
      </div>
    )
  }
  static propTypes = {
    intl: intlShape.isRequired,
    skuData: array.isRequired,
    taskStatuses: object.isRequired,
    activityData: array.isRequired,
    activityType: string.isRequired,
    switchActivityData: func.isRequired,
    userPhotoStatusData: array.isRequired
  }

})

module.exports = { Summary }
