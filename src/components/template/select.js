'use strict'

const React = require('react')
const { PureComponent } = React
const { Select } = require('../select')
const { FormattedMessage } = require('react-intl')
const collate = require('../../collate')
const { bool, array, func, number, string } = require('prop-types')
const cx = require('classnames')

class TemplateSelect extends PureComponent {
  get placeholder() {
    return this.props.placeholder != null &&
      <FormattedMessage id={this.props.placeholder}/>
  }

  focus = () => {
    if (this.select != null) this.select.focus()
  }

  setSelect = (select) => {
    this.select = select
  }

  render() {
    let { isMixed, ...props } = this.props
    return (
      <Select {...props}
        className={cx('template-select', { mixed: isMixed })}
        placeholder={this.placeholder}
        ref={this.setContainer}/>
    )
  }

  static propTypes = {
    isMixed: bool,
    match: func.isRequired,
    options: array.isRequired,
    placeholder: string,
    tabIndex: number.isRequired
  }

  static defaultProps = {
    ...Select.defaultProps,
    match(tpl, query) {
      return collate.match(tpl.name, query, /\b\w/g)
    },
    tabIndex: -1
  }
}

module.exports = {
  TemplateSelect
}
