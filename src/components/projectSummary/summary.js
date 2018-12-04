'use strict'

const React = require('react')
const { PureComponent } = React
const { Row, Col } = require('antd')

class Summary extends PureComponent {
  componentDidMount() {

  }

  componentWillUnmount() {

  }
  render() {

    return (
      <div className="project-summary">
        <Row gutter={24}>
          <Col span={12}>
            <div className="title">项目进度:</div>
            <div className="details">
              <div className="summary-progress"><div className="label">3</div><div className="val">Submitted</div></div>
              <div className="summary-progress"><div className="label">0</div><div className="val">Remaining</div></div>
              <div className="summary-progress"><div className="label">0</div><div className="val">Skipped</div></div>
              <div className="summary-progress"><div className="label">100%</div><div className="val">Complete</div></div>
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
