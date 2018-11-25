'use strict'

const React = require('react')
const { PureComponent } = React
const { Row, Col, Card } = require('antd')
const { Meta } = Card

class Workplace extends PureComponent {
  componentDidMount() {

  }

  componentWillUnmount() {

  }

  render() {

    return (
      <div>
        <Row gutter={24}>
          <Col span={24}>
            <Card
              title="进行中的项目"
              extra={<a href="#">全部项目</a>}>
              <Col span={6}>
                <Card
                  hoverable
                  style={{ width: 240 }}
                  cover={<img alt="example" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />}>
                  <Meta
                    title="Europe Street beat"
                    description="服装标注"/>
                </Card>
              </Col>
              <Col span={6}>
                <Card
                  hoverable
                  style={{ width: 240 }}
                  cover={<img alt="example" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />}>
                  <Meta
                    title="Europe Street beat"
                    description="服装标注"/>
                </Card>
              </Col>
              <Col span={6}>
                <Card
                  hoverable
                  style={{ width: 240 }}
                  cover={<img alt="example" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />}>
                  <Meta
                    title="Europe Street beat"
                    description="服装标注"/>
                </Card>
              </Col>
              <Col span={6}>
                <Card
                  hoverable
                  style={{ width: 240 }}
                  cover={<img alt="example" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />}>
                  <Meta
                    title="Europe Street beat"
                    description="服装标注"/>
                </Card>
              </Col>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

module.exports = {
  Workplace
}
