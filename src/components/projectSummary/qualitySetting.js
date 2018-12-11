'use strict'

const React = require('react')
const { PureComponent, Component } = React
const { Row, Col, Form, Button, Slider, InputNumber, Switch } = require('antd')
const FormItem = Form.Item

class QualityForm extends Component {
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values)
      }
    })
  }

  render() {
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    }
    const { getFieldDecorator } = this.props.form
    return (
      <Form>
        <FormItem style={{ textAlign: 'left' }} label="重复率:" {...formItemLayout} extra="随机分发给协同合作者多次标记的数据行">
          <Switch checkedChildren="开" unCheckedChildren="关" defaultChecked />
        </FormItem>
        <FormItem label="一张图片需要标注次数:"{...formItemLayout}>
          {getFieldDecorator('labelCount', { initialValue: 3 })(
            <InputNumber min={1} max={10} />
          )}
          <span className="ant-form-text"> 张</span>
        </FormItem>
        <FormItem label="多少百分比图片需要重复被标注:"{...formItemLayout}>
          {getFieldDecorator('labelPercent', { initialValue: 10 })(
            <InputNumber min={0} max={100} />
            )}
          <span className="ant-form-text">%</span>
        </FormItem>
        <FormItem
          wrapperCol={{ span: 12, offset: 6 }}>
          <Button type="primary" htmlType="submit">提交</Button>
        </FormItem>
      </Form>
    )
  }
}

class QualitySetting extends PureComponent {
  componentDidMount() {

  }

  componentWillUnmount() {

  }
  render() {
    const WrappedQualityForm = Form.create()(QualityForm)
    return (
      <div>
        <Row>
          <Col span={18} offset={3}>
            <WrappedQualityForm/>
          </Col>
        </Row>
      </div>
    )
  }
}

module.exports = { QualitySetting }
