'use strict'

const React = require('react')
const { PureComponent } = React
const { injectIntl, intlShape } = require('react-intl')
const { bool } = require('prop-types')
const { Tabs, Alert, Checkbox } = require('antd')
const TabPane = Tabs.TabPane
const CheckboxGroup = Checkbox.Group
const plainOptions = ['特斯拉model S', '无人驾驶[道路]', '零售灌装330ML可乐']
const defaultCheckedList = ['Apple', 'Orange']

//Todo data set module
class DataSet extends PureComponent {

  state = {
    checkedList: defaultCheckedList,
    indeterminate: true,
    checkAll: false,
  }

  callback = (key) => {
    console.log(key)
  }

  onChange = (checkedList) => {
    this.setState({
      checkedList,
      indeterminate: !!checkedList.length && (checkedList.length < plainOptions.length),
      checkAll: checkedList.length === plainOptions.length,
    })
  }

  onCheckAllChange = (e) => {
    this.setState({
      checkedList: e.target.checked ? plainOptions : [],
      indeterminate: false,
      checkAll: e.target.checked,
    })
  }

  render() {

    return (
      <div className="dataset-view">
        <Tabs defaultActiveKey="1" onChange={()=>this.callback} style={{ textAlign: 'center' }}>
          <TabPane tab="添加图片" key="1">
            <div style={{ padding: '0px 16px 16px' }}>
              <Alert message="请选择以下一种方式添加图片" />
            </div>
          </TabPane>
          <TabPane tab="已有图片" key="2">
            <div style={{ padding: '0px 40px 40px'}}>
              <div>
                <Checkbox
                  indeterminate={this.state.indeterminate}
                  onChange={this.onCheckAllChange}
                  checked={this.state.checkAll}>
                    全选
                </Checkbox>
              </div>
              <br />
              <CheckboxGroup options={plainOptions} value={this.state.checkedList} onChange={this.onChange} />
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
