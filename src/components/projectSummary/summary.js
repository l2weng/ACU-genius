'use strict'

const React = require('react')
const { PureComponent } = React
const { Row, Col, Radio } = require('antd')
const { Chart, Geom, Axis, Tooltip, Coord } = require('bizcharts')
const { array, object, func } = require('prop-types')

class Summary extends PureComponent {

  render() {

    const data3 = [
      { name: '鲁班', count: 30, cut: '#ff1e66' },
      { name: '韩信', count: 89, cut: '#ff1e66' },
      { name: '张亮', count: 80, cut: '#ff1e66' },
      { name: '孙尚香', count: 99, cut: '#ff1e66' },
      { name: '孙悟空', count: 66, cut: '#ff1e66' }
    ]
    const cols = {
      value: { min: 0 },
      year: { range: [0, 1] }
    }
    const { skuData, taskStatuses, activityData } = this.props
    return (
      <div className="project-summary">
        <Row gutter={24}>
          <Col span={12}>
            <div>
              <div className="title">项目进度:</div>
              <div className="details">
                <div className="summary-progress"><div className="label">{taskStatuses.submitted}</div><div className="val">Submitted</div></div>
                <div className="summary-progress"><div className="label">{taskStatuses.open}</div><div className="val">Remaining</div></div>
                <div className="summary-progress"><div className="label">{taskStatuses.skipped}</div><div className="val">Skipped</div></div>
                <div className="summary-progress"><div className="label">{taskStatuses.progress}%</div><div className="val">Complete</div></div>
              </div>
            </div>
            <div style={{ paddingTop: '24px' }}>
              <div style={{ paddingBottom: '5px' }}>
                <Radio.Group defaultValue="HH" size="small" onChange={this.props.switchActivityData}>
                  <Radio.Button value="HH">Today</Radio.Button>
                  <Radio.Button value="DD">Last 7 days</Radio.Button>
                </Radio.Group>
              </div>
              <div className="title">Labeling Activity:</div>
              <Chart height={400} data={activityData} scale={cols} forceFit placeholder="暂无数据">
                <Axis name="Time" />
                <Axis name="SumCount" />
                <Tooltip crosshairs={{ type: 'y' }}/>
                <Geom type="line" position="Time*SumCount" size={2} />
                <Geom type="point" position="Time*SumCount" size={4} shape={'circle'} style={{ stroke: '#fff', lineWidth: 1 }} />
              </Chart>
            </div>
          </Col>
          <Col span={12}>
            <div>
              <div className="title">Skus:</div>
              <Chart height={300} data={skuData} forceFit placeholder="暂无数据">
                <Coord transpose />
                <Axis name="name" label={{ offset: 12 }} />
                <Axis name="count" />
                <Tooltip />
                <Geom type="interval" color={['color', (color)=>{
                  return color
                }]} position="name*count" />
              </Chart>
            </div>
            <div>
              <div className="title">任务完成率:</div>
              <Chart height={300} data={data3} forceFit>
                <Coord transpose />
                <Axis name="name" label={{ offset: 12 }} />
                <Axis name="count" />
                <Tooltip />
                <Geom type="interval"  position="name*count" />
              </Chart>
            </div>
          </Col>
        </Row>
      </div>
    )
  }
  static propTypes = {
    skuData: array.isRequired,
    taskStatuses: object.isRequired,
    activityData: array.isRequired,
    switchActivityData: func.isRequired
  }
}

module.exports = { Summary }
