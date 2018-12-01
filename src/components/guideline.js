'use strict'

const React = require('react')
const { PureComponent } = React
const { FormattedMessage, injectIntl, intlShape } = require('react-intl')
const { ipcRenderer: ipc  } = require('electron')
const { product, version } = require('../common/release')
const { bool } = require('prop-types')
const { Toolbar } = require('./toolbar')
const { PROJECT } = require('../constants')
const { fail } = require('../dialog')
const { debug, warn } = require('../common/log')
const { Button } = require('antd')


class Guideline extends PureComponent {

  renderToolbar() {
    return this.props.showToolbar && <Toolbar/>
  }

  goCreateProject = () =>{
    try {
      ipc.send(PROJECT.CREATE)
    } catch (error) {
      warn(`failed to create project: ${error.message}`)
      debug(error.stack)

      fail(error, PROJECT.CREATE)
    }
  }

  render() {
    return (
      <div className="about-view">
        {this.renderToolbar()}
        <figure className="app-icon"/>
        <div className="flex-row center">
          <h1><span className="product">{product}</span></h1>
          <p className="version">
            <FormattedMessage id="about.version" values={{ version }}/>
          </p>
          <div>
            <h3>I am guideline!!!!</h3>
            <Button icon="project" onClick={() => this.goCreateProject()}>创建项目</Button>
          </div>
        </div>
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
  Guideline: injectIntl(Guideline)
}
