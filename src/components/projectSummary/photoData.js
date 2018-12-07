'use strict'

const React = require('react')
const { PureComponent } = React
const { Row, Col, Tree } = require('antd')
const { ProjectViewOnly } = require('../project/viewOnly')
const DirectoryTree = Tree.DirectoryTree
const { TreeNode } = Tree
const cx = require('classnames')
const { array, bool, func, object } = require('prop-types')

class PhotoData extends PureComponent {
  componentDidMount() {

  }

  componentWillUnmount() {

  }
  get classes() {
    return ['project', {
      closing: false,
      empty: false,
      over: false,
      ['project-mode']: false,
      ['project-mode-leave']: false,
      ['project-mode-leave-active']: false,
      ['project-mode-enter']: false,
      ['project-mode-enter-active']: false
    }]
  }
  render() {
    const {
      columns,
      data,
      items,
      nav,
      photos,
      ...props
    } = this.props
    return (
      <div className="project-summary">
        <Row gutter={24}>
          <Col span={4}>
            <DirectoryTree
              multiple
              defaultExpandAll
              onSelect={this.onSelect}
              onExpand={this.onExpand}>
              <TreeNode title="可乐" key="0-0">
                <TreeNode title="灌装" key="0-0-0" isLeaf />
                <TreeNode title="瓶装" key="0-0-1" isLeaf />
              </TreeNode>
              <TreeNode title="Tesla" key="0-1">
                <TreeNode title="Model3" key="0-1-0" isLeaf />
                <TreeNode title="Model X" key="0-1-1" isLeaf />
              </TreeNode>
            </DirectoryTree>
          </Col>
          <Col span={20} >
            <div className={cx(this.classes)}>
              <ProjectViewOnly {...props}
                nav={nav}
                items={items}
                data={data}
                isActive
                columns={columns}
                offset={44}
                photos={photos}/></div>
          </Col>
        </Row>
      </div>
    )
  }
  static propTypes = {
    canDrop: bool,
    edit: object.isRequired,
    isActive: bool,
    isOver: bool,
    items: array.isRequired,
    keymap: object.isRequired,
    nav: object.isRequired,
    photos: object.isRequired,
    tags: object.isRequired,
    onItemCreate: func.isRequired,
    onDataSetsCreate: func.isRequired,
    onItemImport: func.isRequired,
    onItemSelect: func.isRequired,
    onItemTagAdd: func.isRequired,
    onMaximize: func.isRequired,
    onSearch: func.isRequired,
    onSort: func.isRequired,
    onUiUpdate: func.isRequired
  }
}

module.exports = { PhotoData }
