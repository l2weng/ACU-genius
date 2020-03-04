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
const { LIST, SELECTION } = require('../../constants')
const { FormattedMessage, intlShape, injectIntl } = require('react-intl')
const __ = require('underscore')

class TargetForm extends Component {
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
      if (!__.isEmpty(task) && (task.id !== LIST.ROOT)) {
        taskOptions.push({ label: task.name, value: task.id })
      }
    })

    return (
      <Modal
        destroyOnClose
        style={{ top: 20 }}
        title={<FormattedMessage id="project.targets.add"/>}
        centered
        maskClosable={false}
        visible={skuModalVisible}
        onOk={this.okHandle}
        onCancel={handleSkuModalVisible}>
        <Form>
          <FormItem {...formItemLayout} label={<FormattedMessage id="project.targets.name"/>}>
            {getFieldDecorator('name', {
              rules: [{ required: true, message: this.props.intl.formatMessage({ id: 'project.targets.nameRequired' }), min: 1 }],
            })(<Input placeholder={this.props.intl.formatMessage({ id: 'common.enterPlease' })} />)}
          </FormItem>
          <FormItem {...formItemLayout} label={<FormattedMessage id="project.targets.labelColor"/>}>
            {getFieldDecorator('circlePicker', {
              rules: [{ required: true, message: this.props.intl.formatMessage({ id: 'project.targets.colorRequired' }) }],
              getValueFromEvent: this.onChangeComplete
            })(<CirclePicker color={getFieldValue('circlePicker')}/>)}
          </FormItem>
          <Form.Item {...formItemLayout} label={<FormattedMessage id="project.targets.labelType"/>} >
            {getFieldDecorator('category', {
              rules: [{ required: true, message: this.props.intl.formatMessage({ id: 'project.targets.categoryRequired' }) }],
              initialValue: [SELECTION.SHAPE_TYPE.RECT, SELECTION.SHAPE_TYPE.POLYGON],
            })(<Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="select one category"
              optionLabelProp="label">
              <Option value={SELECTION.SHAPE_TYPE.RECT} label={<span><FormattedMessage id="project.targets.rectangle"/></span>}>
                <FormattedMessage id="project.targets.rectangle"/>
              </Option>
              <Option value={SELECTION.SHAPE_TYPE.POLYGON} label={<span><FormattedMessage id="project.targets.polygon"/></span>}>
                <FormattedMessage id="project.targets.polygon"/>
              </Option>
            </Select>)}
          </Form.Item>
          <FormItem {...formItemLayout} label={<FormattedMessage id="project.targets.bizId"/>}>
            {getFieldDecorator('bizId', {})(<Input placeholder={this.props.intl.formatMessage({ id: 'project.targets.enterBizPlease' })} />)}
          </FormItem>
          <FormItem {...formItemLayout} label={<FormattedMessage id="project.targets.appliedTo"/>}>
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
    intl: intlShape.isRequired,
    skuModalVisible: bool.isRequired,
    handleSkuModalVisible: func.isRequired,
    saveSku: func.isRequired,
    tasks: object.isRequired,
  }
}

module.exports = {
  TargetForm: injectIntl(TargetForm)
}
