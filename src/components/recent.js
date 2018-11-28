'use strict'

const React = require('react')
const { PureComponent } = React
const { injectIntl, intlShape } = require('react-intl')
const { ipcRenderer: ipc } = require('electron')
const { bool, array } = require('prop-types')
const { Toolbar } = require('./toolbar')
const { PROJECT } = require('../constants')
const { fail } = require('../dialog')
const { debug, warn } = require('../common/log')
const { List, Avatar, Row, Col, Card, Button } = require('antd')
const { Meta } = Card
class Recent extends PureComponent {

  static propTypes = {
    intl: intlShape.isRequired,
    showToolbar: bool.isRequired,
    recent: array.isRequired,
  }
  static defaultProps = {
    showToolbar: ARGS.frameless,
    recent: ARGS.recent,
  }

  handleProjectOpen = (projectFile) => {
    try {
      let file = projectFile
      ipc.send(PROJECT.CREATED, { file })
    } catch (error) {
      warn(`failed to create project: ${error.message}`)
      debug(error.stack)

      fail(error, PROJECT.CREATED)
    }
  }

  renderToolbar() {
    return this.props.showToolbar && <Toolbar/>
  }

  render() {
    let { recent } = this.props
    let data = []
    for (let i = 0; i < recent.length; i++) {
      const project = recent[i]
      data.push({ path: project, desc: '可乐项目' })
    }

    return (
      <div className="about-view">
        {this.renderToolbar()}
        <div className="flex-row center">
          <Row gutter={24}>
            <Col span={12}>
              <Card title="最近项目" bordered={false}>
                <List
                  itemLayout="horizontal"
                  dataSource={data}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar src="https://gw.alipayobjects.com/zos/rmsportal/WhxKECPNujWoWEFNdnJE.png" />}
                        title={<a href="https://ant.design">{item.path}</a>}
                        description={item.desc}
                        onClick={()=>this.handleProjectOpen(item.path)}/>
                    </List.Item>
          )}/>
              </Card>
            </Col>
            <Col span={12} >
              <Card
                bordered={false}
                cover={<img alt="example" src="https://gw.alipayobjects.com/zos/rmsportal/RzwpdLnhmvDJToTdfDPe.png" />}
                actions={[<Button icon="edit">
                  快速开始
                </Button>, <Button icon="setting" >设置</Button>]}>
                <Meta
                  title="Label Real help you label everything!"/>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}

module.exports = {
  Recent: injectIntl(Recent),
}
