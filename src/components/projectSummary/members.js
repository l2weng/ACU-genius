'use strict'

const React = require('react')
const { PureComponent } = React
const { Drawer, List, Avatar, Divider, Col, Row, Card } = require('antd')

const data = [{
  key: '1',
  name: 'John Brown',
  role: '所有者',
  level: '王者',
  joinTime: '11/12/2018',
}, {
  key: '2',
  name: 'Jim Green',
  role: '参与者',
  level: '钻石',
  joinTime: '12/01/2018',
}, {
  key: '3',
  name: 'Joe Black',
  role: '参与者',
  level: '黄金',
  joinTime: '12/19/2018',
}, {
  key: '4',
  name: 'Freedom Forever',
  role: '组长',
  level: '荣耀王者',
  joinTime: '12/31/2018',
}]

const pStyle = {
  fontSize: 16,
  color: 'rgba(0,0,0,0.85)',
  lineHeight: '24px',
  display: 'block',
  marginBottom: 16,
}

const DescriptionItem = ({ title, content }) => (
  <div
    style={{
      fontSize: 14,
      lineHeight: '22px',
      marginBottom: 7,
      color: 'rgba(0,0,0,0.65)',
    }}>
    <p
      style={{
        marginRight: 8,
        display: 'inline-block',
        color: 'rgba(0,0,0,0.85)',
      }}>
      {title}:
    </p>
    {content}
  </div>
)

class Members extends PureComponent {

  state = { visible: false };

  showDrawer = () => {
    this.setState({
      visible: true,
    })
  };

  onClose = () => {
    this.setState({
      visible: false,
    })
  };

  componentDidMount() {

  }

  componentWillUnmount() {

  }
  render() {
    return (
      <div>
        <List
          dataSource={[
            {
              name: 'Freedom Forever',
              icon: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
              desc: '荣耀王者'
            },
            {
              name: 'John Brown',
              icon: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
              desc: '钻石'
            },
            {
              name: 'Tory Burberry',
              icon: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
              desc: '星耀'
            },
          ]}
          bordered={false}
          grid={{ gutter: 21, column: 3 }}
          renderItem={item => (
            <List.Item key={item.id} actions={[]}>
              <Card>
                <List.Item.Meta
                  avatar={
                    <Avatar src={item.icon} />
                }
                  title={<a href="javascript:;" onClick={this.showDrawer}>{item.name}</a>}
                  description={item.desc}/>
              </Card>
            </List.Item>
          )}/>
        <Drawer
          width={640}
          placement="right"
          closable={false}
          onClose={this.onClose}
          visible={this.state.visible}>
          <p style={{ ...pStyle, marginBottom: 24 }}>User Profile</p>
          <p style={pStyle}>Personal</p>
          <Row>
            <Col span={12}>
              <DescriptionItem title="Full Name" content="Lily" />{' '}
            </Col>
            <Col span={12}>
              <DescriptionItem title="Account" content="AntDesign@example.com" />
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <DescriptionItem title="City" content="HangZhou" />
            </Col>
            <Col span={12}>
              <DescriptionItem title="Country" content="China🇨🇳" />
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <DescriptionItem title="Birthday" content="February 2,1900" />
            </Col>
            <Col span={12}>
              <DescriptionItem title="Website" content="-" />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <DescriptionItem
                title="Message"
                content="Make things as simple as possible but no simpler."/>
            </Col>
          </Row>
          <Divider />
          <p style={pStyle}>Company</p>
          <Row>
            <Col span={12}>
              <DescriptionItem title="Position" content="Programmer" />
            </Col>
            <Col span={12}>
              <DescriptionItem title="Responsibilities" content="Coding" />
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <DescriptionItem title="Department" content="AFX" />
            </Col>
            <Col span={12}>
              <DescriptionItem title="Supervisor" content={<a>Lin</a>} />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <DescriptionItem
                title="Skills"
                content="C / C + +, data structures, software engineering, operating systems, computer networks, databases, compiler theory, computer architecture, Microcomputer Principle and Interface Technology, Computer English, Java, ASP, etc."/>
            </Col>
          </Row>
          <Divider />
          <p style={pStyle}>Contacts</p>
          <Row>
            <Col span={12}>
              <DescriptionItem title="Email" content="AntDesign@example.com" />
            </Col>
            <Col span={12}>
              <DescriptionItem title="Phone Number" content="+86 181 0000 0000" />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <DescriptionItem
                title="Github"
                content={(
                  <a href="http://github.com/ant-design/ant-design/">
                    github.com/ant-design/ant-design/
                  </a>
                )}/>
            </Col>
          </Row>
        </Drawer>
      </div>
    )
  }
}

module.exports = { Members }
