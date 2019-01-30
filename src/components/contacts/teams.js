'use strict'

const React = require('react')
const { PureComponent } = React
const { List, Card, Button, Icon, Avatar } = require('antd')

class Teams extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
    }
  }

  componentDidMount() {

  }

  render() {
    const { loading } = this.state
    const list = [
      { title: '射手', name: '鲁' },
      { title: '战士', name: '亚' },
      { title: '法师', name: '墨' },
      { title: '刺客', name: '典' }]

    return (
      <div className="cardList">
        <List
          rowKey="id"
          loading={loading}
          grid={{ gutter: 24, lg: 4, md: 3, sm: 2, xs: 1 }}
          dataSource={['', ...list]}
          renderItem={item =>
            item ? (
              <List.Item key={item.id}>
                <Card hoverable className="card"
                  actions={[<a>操作一</a>, <a>操作二</a>]}>
                  <Card.Meta
                    avatar={<Avatar alt="" className="cardAvatar" style={{ backgroundColor: '#87d068' }}>{item.name}</Avatar>}
                    title={<a>{item.title}</a>}
                    description="www.instagram.com"/>
                </Card>
              </List.Item>
            ) : (
              <List.Item>
                <Button type="dashed" className="newButton">
                  <Icon type="plus"/> 新增产品
                </Button>
              </List.Item>
            )
          }/>
      </div>
    )
  }
}

module.exports = {
  Teams,
}
