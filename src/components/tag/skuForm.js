'use strict'

const React = require('react')
const { Component } = React
const {
  Form, Input, Select, Modal, Checkbox
} = require('antd')
const FormItem = Form.Item
const Option = Select.Option
const { bool, func, object } = require('prop-types')
const { CirclePicker } = require('react-color')
const { IconSelection, IconPolygon } = require('../icons')
const { LIST } = require('../../constants')

class SkuForm extends Component {
  state = {
    confirmDirty: false,
  };


  handleSubmit = (values) => {
    this.props.saveSku(values)
    this.props.form.resetFields()
    this.props.handleSkuModalVisible()
  }

  onChangeComplete = (color, event)=>{
    return color.hex
  }
  onChange = (taskValue) =>{
    return taskValue
  }

  okHandle = () => {
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) return
      this.handleSubmit(fieldsValue)
    })
  }

  render() {

    const { getFieldDecorator, getFieldValue } = this.props.form
    const { skuModalVisible, handleSkuModalVisible, tasks } = this.props
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    }
    let taskOptions = []
    Object.values(tasks).map(task => {
      if (task && (task.id !== LIST.ROOT)) {
        taskOptions.push({ label: task.name, value: task.id })
      }
    })

    return (
      <Modal
        destroyOnClose
        style={{ top: 20 }}
        title="添加目标样本"
        centered
        maskClosable={false}
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
            })(<CirclePicker color={getFieldValue('circlePicker')}/>)}
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
          <FormItem {...formItemLayout} label="应用于任务">
            {getFieldDecorator('taskSelect', {
              getValueFromEvent: this.onChange
            })(
              <Checkbox.Group options={taskOptions}/>
              )}
          </FormItem>
        </Form>
      </Modal>
    )
  }

  static propTypes = {
    skuModalVisible: bool.isRequired,
    handleSkuModalVisible: func.isRequired,
    saveSku: func.isRequired,
    tasks: object.isRequired,
  }
}

module.exports = {
  SkuForm
}
