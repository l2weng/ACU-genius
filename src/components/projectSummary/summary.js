'use strict'

const React = require('react')
const { PureComponent } = React
const { Row, Col } = require('antd')
const {
  Chart,
  Geom,
  Axis,
  Tooltip,
} = require('bizcharts')
class Summary extends PureComponent {
  componentDidMount() {

  }

  componentWillUnmount() {

  }
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
    const cols = {
      value: { min: 0 },
      year: { range: [0, 1] }
    }
    return (
      <div className="project-summary">
        <Row gutter={24}>
          <Col span={12}>
            <div>
              <div className="title">项目进度:</div>
              <div className="details">
                <div className="summary-progress"><div className="label">3</div><div className="val">Submitted</div></div>
                <div className="summary-progress"><div className="label">0</div><div className="val">Remaining</div></div>
                <div className="summary-progress"><div className="label">0</div><div className="val">Skipped</div></div>
                <div className="summary-progress"><div className="label">100%</div><div className="val">Complete</div></div>
              </div>
            </div>
            <div style={{ paddingTop: '24px' }}>
              <div className="title">Labeling Activity:</div>
              <Chart height={400} data={data} scale={cols} forceFit>
                <Axis name="year" />
                <Axis name="value" />
                <Tooltip crosshairs={{ type: 'y' }}/>
                <Geom type="line" position="year*value" size={2} />
                <Geom type="point" position="year*value" size={4} shape={'circle'} style={{ stroke: '#fff', lineWidth: 1 }} />
              </Chart>
            </div>
          </Col>
          <Col span={12}>
            右边
          </Col>
        </Row>
      </div>
    )
  }
}

module.exports = { Summary }
