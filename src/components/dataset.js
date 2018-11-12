'use strict'

const React = require('react')
const { PureComponent } = React
const { injectIntl, intlShape } = require('react-intl')
const { bool } = require('prop-types')
const { Toolbar } = require('./toolbar')

//Todo data set module
class DataSet extends PureComponent {

  renderToolbar() {
    return this.props.showToolbar && <Toolbar/>
  }

  handleAddNewPhotos = () => {
  }

  handleSelectOwnPhotos = () => {
  }

  render() {
    return (
      <div className="about-view">
        {this.renderToolbar()}
        <figure className="app-icon"/>
        <div className="flex-row center">
          <div>
            <h5>添加图片</h5>
            <div>
              <button>选择图片/文件夹</button>
            </div>
            <div>
              输入URL <input type="text"/>
            </div>
          </div>
          <hr/>
          <div>
            <h5>选择已有图片</h5>
            <div>
              <input type="checkbox" id="scales" name="scales"/>
              <label htmlFor="scales">cola</label>
            </div>
            <div>
              <input type="checkbox" id="horns" name="horns"/>
              <label htmlFor="horns">北美</label>
            </div>
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
  DataSet: injectIntl(DataSet)
}
