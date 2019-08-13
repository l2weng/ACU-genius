'use strict'

const React = require('react')
const { PureComponent } = React
const { Row, Col } = require('antd')
const { Chart, Geom, Axis, Tooltip, Coord } = require('bizcharts')
const { array, object } = require('prop-types')

class Summary extends PureComponent {

  render() {
    const data = [
      { year: '4 Dec 2018', value: 3 },
      { year: '5 Dec 2018', value: 4 },
      { year: '6 Dec 2018', value: 3.5 },
      { year: '7 Dec 2018', value: 5 },
      { year: '8 Dec 2018', value: 4.9 },
      { year: '9 Dec 2018', value: 6 },
      { year: '10 Dec 2018', value: 7 },
      { year: '11 Dec 2018', value: 9 },
      { year: '12 Dec 2018', value: 13 }
    ]
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
              <div className="title">Labeling Activity:</div>
              <Chart height={400} data={activityData} scale={cols} forceFit>
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
    activityData: array.isRequired
  }
}

module.exports = { Summary }
