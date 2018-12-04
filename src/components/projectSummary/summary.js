'use strict'

const React = require('react')
const { PureComponent } = React
const { Row, Col } = require('antd')
const { Chart, Geom, Axis, Tooltip, Coord } = require('bizcharts')

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
    const data2 = [
      { country: '中国', population: 101744 },
      { country: '印度', population: 74970 },
      { country: '美国', population: 29034 },
      { country: '印尼', population: 23489 },
      { country: '巴西', population: 18203 }
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
            <div>
              <div className="title">Skus:</div>
              <Chart height={400} data={data2} forceFit>
                <Coord transpose />
                <Axis name="country" label={{ offset: 12 }} />
                <Axis name="population" />
                <Tooltip />
                <Geom type="interval" position="country*population" />
              </Chart>
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}

module.exports = { Summary }
