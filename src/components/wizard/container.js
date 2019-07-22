'use strict'

const React = require('react')
const { PureComponent } = React
const { func, shape, string } = require('prop-types')
const { connect } = require('react-redux')
const { Steps } = require('../steps')
const { Toolbar } = require('../toolbar')
const { ProjectStep } = require('./project')
const { join, dirname, resolve } = require('path')
const actions = require('../../actions')
const sanitize = require('sanitize-filename')
const { blank } = require('../../common/util')
const { existsSync: exists } = require('fs')
const { userInfo } = ARGS
const uuid = require('uuid/v4')

class WizardContainer extends PureComponent {
  get hasDefaultFilename() {
    return this.props.project.file === this.getDefaultFilename()
  }

  getDefaultFilename(name = this.props.project.name, count = 0) {
    if (blank(name)) return ''

    const file = join(
      this.props.userData,
      sanitize(`${name}${count > 0 ? count : ''}.lbr`))

    return exists(file) ?
      this.getDefaultFilename(name, count + 1) :
      file
  }

  handleComplete = () => {
    const { file } = this.props.project
    this.props.project.file = resolve(dirname(file), `${uuid()}.lbr`)
    this.props.onComplete({ ...this.props.project, owner: userInfo.user.userId }, { truncate: true })
  }

  handleNameChange = (name) => {
    this.props.onProjectUpdate({
      name,
      file: this.getDefaultFilename(name)
    })
  }

  handleBaseChange = ({ base }) => {
    this.props.onProjectUpdate({ base: base ? 'project' : null })
  }

  handleFileSelect = () => {
    this.props.onProjectSaveAs(
      this.props.project.file || this.props.userData
    )
  }

  render() {
    return (
      <div className="wizard">
        <Toolbar/>
        <Steps>
          <ProjectStep {...this.props.project}
            hasDefaultFilename={this.hasDefaultFilename}
            onBaseChange={this.handleBaseChange}
            onNameChange={this.handleNameChange}
            onFileSelect={this.handleFileSelect}
            onComplete={this.handleComplete}/>
        </Steps>
      </div>
    )
  }

  static propTypes = {
    project: shape({
      base: string,
      file: string.isRequired,
      name: string.isRequired
    }).isRequired,
    userData: string.isRequired,
    onComplete: func.isRequired,
    onProjectSaveAs: func.isRequired,
    onProjectUpdate: func.isRequired
  }
}


module.exports = {
  WizardContainer: connect(
    ({ wizard }) => ({
      project: wizard.project,
      userData: wizard.userData
    }),

    (dispatch) => ({
      onProjectUpdate(...args) {
        dispatch(actions.wizard.project.update(...args))
      },

      onProjectSaveAs(...args) {
        dispatch(actions.wizard.project.save(...args))
      },

      onComplete(...args) {
        dispatch(actions.wizard.complete(...args))
      }
    })
  )(WizardContainer)
}
