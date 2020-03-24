'use strict'

const React = require('react')
const { PureComponent } = React
const { array, string } = require('prop-types')
const { Form, Select, Button, message } = require('antd')
const { EXPORT } = require('../../constants')
const { FormattedMessage, intlShape, injectIntl } = require('react-intl')
const { dialog } = require('electron').remote
const fs = require('fs')
const axios = require('axios')

const Export = injectIntl(class extends PureComponent {

  static propTypes = {
    intl: intlShape.isRequired,
    projects: array.isRequired,
    cProjectId: string.isRequired
  }

  constructor(props) {
    super(props)
    this.state = { currentProjectId: props.cProjectId, exportFormat: EXPORT.JSON }
  }

  onExportProjectChange = (value)=>{
    this.setState({ currentProjectId: value })
  }

  onExportFormatChange = (value)=>{
    this.setState({ exportFormat: value })
  }

  exportData = () => {
    const { currentProjectId, exportFormat } = this.state
    console.log(exportFormat)
    let self = this
    axios.post(`${ARGS.apiServer}/reports/export`, { projectId: currentProjectId })
    .then(function (response) {
      if (response.status === 200) {
        if (exportFormat === EXPORT.JSON) {
          let savePath = dialog.showSaveDialog({ filters: [
              { name: 'JSON Files', extensions: ['json'] }
          ]
          })
          fs.writeFile(savePath, JSON.stringify(response.data.data.exportResult), 'utf8', () => {
            console.log(`Wrote export' json data to "${savePath}"`)
          })
        } else if (exportFormat === EXPORT.EXCEL) {

        }
      } else {
        message.error(self.props.intl.formatMessage({ id: 'summary.exportError' }))
      }
    })
  }

  render() {

    const { projects } = this.props
    const { currentProjectId, exportFormat } = this.state
    return (
      <div>
        <Form layout={'inline'}>
          <Form.Item  label={<FormattedMessage id="summary.currentProject"/>}>
            <Select style={{ width: 120 }} defaultValue={currentProjectId} value={currentProjectId}  onChange={this.onExportProjectChange}>
              {projects.map(project=>{
                return (<Select.Option value={project.projectId} key={project.projectId}>{project.name}</Select.Option>)
              })}
            </Select>
          </Form.Item>
          <Form.Item  label={<FormattedMessage id="summary.format"/>}>
            <Select style={{ width: 120 }} defaultValue={EXPORT.JSON} vlue={exportFormat} onChange={this.onExportFormatChange}>
              <Select.Option value={EXPORT.JSON} key={EXPORT.JSON}>JSON</Select.Option>
              <Select.Option value={EXPORT.EXCEL} key={EXPORT.EXCEL}>Excel</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button icon="project" onClick={this.exportData}>{this.props.intl.formatMessage({ id: 'summary.export' })}</Button>
          </Form.Item>
        </Form>
      </div>
    )
  }
})

module.exports = { Export }
