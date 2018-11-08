'use strict'

const React = require('react')
const { PureComponent } = React
const { injectIntl, intlShape } = require('react-intl')
const { ipcRenderer: ipc } = require('electron')
const { bool, array } = require('prop-types')
const { Toolbar } = require('./toolbar')
const { PROJECT } = require('../constants')
const { fail } = require('../dialog')
const { debug, warn } = require('../common/log')

class Recent extends PureComponent {

  static propTypes = {
    intl: intlShape.isRequired,
    showToolbar: bool.isRequired,
    recent: array.isRequired,
  }
  static defaultProps = {
    showToolbar: ARGS.frameless,
    recent: ARGS.recent,
  }
  handleProjectOpen = (projectFile) => {
    try {
      let file = projectFile
      ipc.send(PROJECT.CREATED, { file })
    } catch (error) {
      warn(`failed to create project: ${error.message}`)
      debug(error.stack)

      fail(error, PROJECT.CREATED)
    }
  }

  renderToolbar() {
    return this.props.showToolbar && <Toolbar/>
  }

  render() {
    let { recent } = this.props
    return (
      <div className="about-view">
        {this.renderToolbar()}
        <ul>
          {recent.length > 0 ? recent.map((project, index) => {
            return (<li key={index} onClick={() => this.handleProjectOpen(
              project)}>{project}</li>)
          }) : ''}
        </ul>
      </div>
    )
  }
}

module.exports = {
  Recent: injectIntl(Recent),
}
