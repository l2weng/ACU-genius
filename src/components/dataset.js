'use strict'

const React = require('react')
const { PureComponent } = React
const { injectIntl, intlShape } = require('react-intl')
const { bool } = require('prop-types')
const { Upload, Tabs, Alert, Checkbox, Icon, Button, message, Input } = require('antd')
const TabPane = Tabs.TabPane
const CheckboxGroup = Checkbox.Group
const plainOptions = ['特斯拉model S', '无人驾驶[道路]', '零售灌装330ML可乐']
const defaultCheckedList = ['Apple', 'Orange']
const Dragger = Upload.Dragger
const props = {
  name: 'file',
  multiple: true,
  action: '//jsonplaceholder.typicode.com/posts/',
  onChange(info) {
    const status = info.file.status
    if (status !== 'uploading') {
      console.log(info.file, info.fileList)
    }
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`)
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`)
    }
  },
}

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
            <div style={{ padding: '0 40px 40px' }}>
              <Alert message="请使用一下方式添加图片" />
              <Tabs style={{ textAlign: 'left', paddingTop: '16px' }}
                defaultActiveKey="1"
                tabPosition="left">
                <TabPane tab="拖拽图片" key="1">
                  <Dragger {...props}>
                    <p className="ant-upload-drag-icon">
                      <Icon type="inbox" />
                    </p>
                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                    <p className="ant-upload-hint">Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files</p>
                  </Dragger>
                </TabPane>
                <TabPane tab="选中文件夹" key="2">
                  <Upload directory>
                    <Button>
                      <Icon type="upload" /> 上传文件夹
                    </Button>
                  </Upload>
                </TabPane>
                <TabPane tab="服务器地址" key="3">
                  <Input placeholder="例如: http://www.labelreal/api/car" />
                </TabPane>
              </Tabs>
            </div>
          </TabPane>
          <TabPane tab="已有图片" key="2">
            <div style={{ padding: '0px 40px 40px' }}>
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
