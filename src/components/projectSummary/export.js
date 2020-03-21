'use strict'

const React = require('react')
const { PureComponent } = React
const { array, string } = require('prop-types')
const { Form, Select } = require('antd')
const { FormattedMessage, intlShape, injectIntl } = require('react-intl')

const Export = injectIntl(class extends PureComponent {

  static propTypes = {
    intl: intlShape.isRequired,
    projects: array.isRequired,
    cProjectId: string.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    const layout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    }
    const { projects, cProjectId } = this.props
    return (
      <div>
        <Form {...layout}>
          <Form layout={'inline'}>
            <Form.Item  label={<FormattedMessage id="summary.project"/>}>
              <Select style={{ width: 120 }} defaultValue={cProjectId} value={cProjectId}>
                {projects.map(project=>{
                  return (<Option value={project.projectId} key={project.projectId}>{project.name}</Option>)
                })}
              </Select>
            </Form.Item>
          </Form>
        </Form>
      </div>
    )
  }
})

module.exports = { Export }
