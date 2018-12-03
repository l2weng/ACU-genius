'use strict'

const React = require('react')
const { PureComponent } = React
const { injectIntl, intlShape } = require('react-intl')
const { bool } = require('prop-types')
const { Tabs, Alert, List, Checkbox, Row, Col } = require('antd')
const TabPane = Tabs.TabPane
const { Toolbar } = require('./toolbar')

//Todo data set module
class DataSet extends PureComponent {

  callback = (key) => {
    console.log(key)
  }

  handleAddNewPhotos = () => {
  }

  handleSelectOwnPhotos = () => {
  }

  renderToolbar() {
    return this.props.showToolbar && <Toolbar/>
  }

  render() {

    const data = [
      {
        title: '可乐中国',
        desc: '330ml 可乐,660ml可乐, 330ml 美汁源',
      },
      {
        title: '智能驾驶上海',
        desc: '蔚来汽车, 小鹏汽车',
      },
      {
        title: '智能驾驶北京',
        desc: '特斯拉model3, tesla Model X',
      },
      {
        title: '能量型饮料',
        desc: 'Monstar, 魔抓',
      },
    ]

    return (
      <div className="dataset-view">
        <Tabs defaultActiveKey="1" onChange={()=>this.callback} style={{ textAlign: 'center' }}>
          <TabPane tab="添加图片" key="1">
            <div style={{ padding: '0px 16px 16px' }}>
              <Alert message="请选择以下一种方式添加图片" />
            </div>
          </TabPane>
          <TabPane tab="已有图片" key="2">
            <div style={{ padding: '0px 16px 16px' }}>
              <List
                itemLayout="horizontal"
                dataSource={data}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Checkbox/>}
                      title={<a href="https://ant.design">{item.title}</a>}
                      description={item.desc}/>
                  </List.Item>
              )}/>
            </div>
          </TabPane>
        </Tabs>
      </div>
    )
  }

  static propTypes = {
    intl: intlShape.isRequired,
    showToolbar: bool.isRequired
  }

  static defaultProps = {
    showToolbar: ARGS.frameless
  }
}

module.exports = {
  DataSet: injectIntl(DataSet)
}
