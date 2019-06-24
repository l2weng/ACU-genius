'use strict'

const React = require('react')
const { PureComponent } = React
const { injectIntl, intlShape } = require('react-intl')
const { Input } = require('../input')
const { blank, noop } = require('../../common/util')
const { arrayOf, bool, func, number, shape, string } = require('prop-types')
const {  Select } = require('antd')
const collate = require('../../collate')
const { Option } = Select

class TagAdder extends PureComponent {
  get placeholder() {
    const { count, intl } = this.props
    return intl.formatMessage({ id: 'panel.tags.add' }, { count })
  }

  focus() {
    this.input.focus()
  }

  handleBlur = (event) => {
    this.props.onBlur(event)
    return true // cancel on blur
  }

  handleChange = (name) => {
    if (blank(name)) return this.props.onCancel()

    const query = name.trim().toLowerCase()
    const tag = this.props.tags.find(t => query === t.name.toLowerCase())

    if (tag) {
      this.props.onAdd(tag)
    } else {
      this.props.onCreate({ name })
    }

    this.input.reset()
  }

  handleTagChange = (tags) =>{
    if (tags.length > 0) { tags = tags.map(tag=>(parseInt(tag, 10))) }
    this.props.onItemTagChange(tags)
  }

  setInput = (input) => {
    this.input = input
  }

  render() {

    const { itemTags, tags } = this.props

    const children = []
    for (let i = 0; i < tags.length; i++) {
      children.push(<Option key={tags[i].id}>{tags[i].name}</Option>)
    }
    const defaultTag = itemTags.map(tag=>(`${tag.id}`))
    return (
      <div className="add-tag-container">
        {/*<Input*/}
        {/*  ref={this.setInput}*/}
        {/*  className="form-control"*/}
        {/*  completions={this.props.completions}*/}
        {/*  isDisabled={this.props.isDisabled}*/}
        {/*  match={this.props.match}*/}
        {/*  placeholder={this.placeholder}*/}
        {/*  tabIndex={-1}*/}
        {/*  value=""*/}
        {/*  onBlur={this.handleBlur}*/}
        {/*  onFocus={this.props.onFocus}*/}
        {/*  onCancel={this.props.onCancel}*/}
        {/*  onCommit={this.handleChange}/>*/}
        <Select
          key={defaultTag}
          mode="tags"
          size="small"
          tabIndex={-1}
          defaultValue={defaultTag}
          placeholder={this.placeholder}
          onChange={this.handleTagChange}
          style={{ width: '100%' }}>
          {children}
        </Select>
      </div>
    )
  }

  static propTypes = {
    count: number.isRequired,
    completions: arrayOf(string).isRequired,
    intl: intlShape.isRequired,
    isDisabled: bool,
    match: func.isRequired,
    tags: arrayOf(shape({
      id: number.isRequired,
      name: string.isRequired
    })),
    itemTags: arrayOf(shape({
      id: number.isRequired,
      name: string.isRequired
    })).isRequired,
    onAdd: func.isRequired,
    onBlur: func.isRequired,
    onItemTagChange: func.isRequired,
    onCancel: func.isRequired,
    onFocus: func.isRequired,
    onCreate: func.isRequired
  }

  static defaultProps = {
    match: (value, query) => (
      collate.match(value.name || String(value), query, /\b\w/g)
    ),
    onFocus: noop
  }
}

module.exports = {
  TagAdder: injectIntl(TagAdder, { withRef: true })
}
