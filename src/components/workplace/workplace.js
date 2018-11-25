'use strict'

const React = require('react')
const { PureComponent } = React
const { Row, Col, Card, Table, Divider, Tag } = require('antd')
const { Meta } = Card

class Workplace extends PureComponent {
  componentDidMount() {

  }

  componentWillUnmount() {

  }


  render() {

    const columns = [{
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: text => <a href="javascript:;">{text}</a>,
    }, {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
    }, {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    }, {
      title: 'Tags',
      key: 'tags',
      dataIndex: 'tags',
      render: tags => (
        <span>
          {tags.map(tag => <Tag color="blue" key={tag}>{tag}</Tag>)}
        </span>
      ),
    }, {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <span>
          <a href="javascript:;">Invite {record.name}</a>
          <Divider type="vertical" />
          <a href="javascript:;">Delete</a>
        </span>
      ),
    }]

    const data = [{
      key: '1',
      name: 'John Brown',
      age: 32,
      address: 'New York No. 1 Lake Park',
      tags: ['nice', 'developer'],
    }, {
      key: '2',
      name: 'Jim Green',
      age: 42,
      address: 'London No. 1 Lake Park',
      tags: ['loser'],
    }, {
      key: '3',
      name: 'Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park',
      tags: ['cool', 'teacher'],
    }]

    return (
      <div style={{ overflow: 'scroll' }}>
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
            <Card
              title="进行中的任务"
              extra={<a href="#">全部任务</a>}>
              <Table columns={columns} dataSource={data} />
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
