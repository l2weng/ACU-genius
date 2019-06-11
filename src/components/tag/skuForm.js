'use strict'

const React = require('react')
const { Component } = React
const {
  Form, Input, Tooltip, Icon, Select, Button, message, Modal
} = require('antd')
const FormItem = Form.Item
const Option = Select.Option
const axios = require('axios')
const { bool, func } = require('prop-types')
const { ipcRenderer: ipc  } = require('electron')
const { USER } = require('../../constants')
const { getLocalIP } = require('../../common/serviceUtil')
const { getUrlFilterParams } = require('../../common/dataUtil')
const { CirclePicker } = require('react-color')
const { IconSelection, IconPolygon } = require('../icons')


class SkuForm extends Component {
  state = {
    confirmDirty: false,
  };

  handleSubmit = (values) => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      console.log(values)
      // if (!err) {
      //   axios.post(`${ARGS.apiServer}/users/create`, values).then(res => {
      //     if (res.status === 200) {
      //       const key = `open${Date.now()}`
      //       const btn = (
      //         <Button type="primary" size="small" onClick={() => this.goProject(res.data.obj, notification, key)}>
      //           Go
      //         </Button>
      //       )
      //       notification.open({
      //         message: '注册成功',
      //         description: 'LabelReal带您开启AI标注大门',
      //         icon: <Icon type="smile" style={{ color: '#108ee9' }} />,
      //         btn,
      //         key,
      //         placement: 'bottomRight',
      //         onClose: this.close,
      //       })
      //     }
      //   })
      //   .catch((err)=> {
      //     message.error('服务器问题, 请联系客服', err)
      //   })
      // }
    })
  }

  goProject = (userInfo, registerNotification, key) => {
    registerNotification.close(key)
    let loginData = { username: userInfo.name, password: userInfo.password }
    loginData.ip = getLocalIP()
    axios.post(`${ARGS.apiServer}/auth`, loginData)
    .then(function (response) {
      if (response.status === 200) {
        ipc.send(USER.LOGINED, { data: response.data })
      }
    })
    .catch(function (error) {
      message.warning('用户名密码错误, 请重试')
    })
  }

  onChangeComplete = (color, event)=>{
    return color.hex
  }

  okHandle = () => {
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) return
      this.handleSubmit(fieldsValue)
      // this.props.form.resetFields()
    })
  }

  render() {

    const { getFieldDecorator, getFieldValue } = this.props.form
    const { skuModalVisible, handleSkuModalVisible } = this.props
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    }

    return (
      <Modal
        destroyOnClose
        style={{ top: 20 }}
        title="添加目标样本"
        centered
        visible={skuModalVisible}
        onOk={this.okHandle}
        onCancel={handleSkuModalVisible}>
        <Form>
          <FormItem {...formItemLayout} label="样本名称">
            {getFieldDecorator('name', {
              rules: [{ required: true, message: '请输入名称！', min: 1 }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
          <FormItem {...formItemLayout} label="标注颜色">
            {getFieldDecorator('circlePicker', {
              rules: [{ required: true, message: '请选择颜色！' }],
              getValueFromEvent: this.onChangeComplete
            })(<CirclePicker color={getFieldValue('circlePicker') || '#f44336'}/>)}
          </FormItem>
          <Form.Item {...formItemLayout} label="标注类型" >
            {getFieldDecorator('category', {
              rules: [{ required: true, message: '请选择标注类型！' }],
              initialValue: 'rect',
            })(<Select
              style={{ width: '100%' }}
              placeholder="select one category"
              optionLabelProp="label">
              <Option value="rect" label={<span><IconSelection/>矩形框</span>}>
                <span role="img" aria-label="矩形框">
                  <IconSelection/>&nbsp;矩形框
                </span>
              </Option>
              <Option value="polygon" label={<span><IconSelection/>多边形框</span>}>
                <span role="img" aria-label="多边形框">
                  <IconPolygon/>&nbsp;多边形框
                </span>
              </Option>
            </Select>)}
          </Form.Item>
        </Form>
      </Modal>
    )
  }

  static propTypes = {
    skuModalVisible: bool.isRequired,
    handleSkuModalVisible: func.isRequired
  }
}

module.exports = {
  SkuForm
}
