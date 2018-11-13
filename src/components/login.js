'use strict'

const React = require('react')
const { PureComponent } = React
const { injectIntl, intlShape } = require('react-intl')
const { shell } = require('electron')
const { bool } = require('prop-types')
const { Toolbar } = require('./toolbar')

//Todo login module
class Login extends PureComponent {

  renderToolbar() {
    return this.props.showToolbar && <Toolbar/>
  }

  render() {
    return (
      <div className="about-view">
        {this.renderToolbar()}
        <figure className="app-icon"/>
        <form action="" method="get" className="form-example">
          <div className="form-example">
            <label htmlFor="name">Enter your name: </label>
            <input type="text" name="name" id="name" required/>
          </div>
          <div className="form-example">
            <label htmlFor="email">Enter your email: </label>
            <input type="email" name="email" id="email" required/>
          </div>
          <div className="form-example">
            <input type="submit" value="Login!"/>
            <button onClick={()=>shell.openExternal('http://www.labelreal.com/register')}>Register</button>
          </div>
        </form>
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
  Login: injectIntl(Login)
}
