'use strict'

const React = require('react')
const { PureComponent } = React
const { Toolbar, ToolGroup, ToolbarLeft } = require('../toolbar')
const { Button, Icon, Tooltip, Tag } = require('antd')
const { Button: LRButton } = require('../button')
const { IconChevron16, IconChevron17 } = require('../icons')
const { func, object, array } = require('prop-types')
const { emit } = require('../../dom')
const { FormattedMessage } = require('react-intl')
const moment = require('moment-timezone')
const __ = require('underscore')
const SkipSvg = () => (
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
    viewBox="0 0 487.958 487.958" style={{ enableBackground: 'new 0 0 487.958 487.958' }} xmlSpace="preserve" width="1em" height="1em">
    <g>
      <path fill="currentColor" d="M483.058,215.613l-215.5-177.6c-4-3.3-9.6-4-14.3-1.8c-4.7,2.2-7.7,7-7.7,12.2v93.6c-104.6,3.8-176.5,40.7-213.9,109.8
c-32.2,59.6-31.9,130.2-31.6,176.9c0,3.8,0,7.4,0,10.8c0,6.1,4.1,11.5,10.1,13.1c1.1,0.3,2.3,0.4,3.4,0.4c4.8,0,9.3-2.5,11.7-6.8
c73-128.7,133.1-134.9,220.2-135.2v93.3c0,5.2,3,10,7.8,12.2s10.3,1.5,14.4-1.8l215.4-178.2c3.1-2.6,4.9-6.4,4.9-10.4
S486.158,218.213,483.058,215.613z M272.558,375.613v-78.1c0-3.6-1.4-7-4-9.5c-2.5-2.5-6-4-9.5-4c-54.4,0-96.1,1.5-136.6,20.4
c-35,16.3-65.3,44-95.2,87.5c1.2-39.7,6.4-87.1,28.1-127.2c34.4-63.6,101-95.1,203.7-96c7.4-0.1,13.4-6.1,13.4-13.5v-78.2
l180.7,149.1L272.558,375.613z"/>
    </g>
  </svg>
)

class EsperFootToolbar extends PureComponent {

  confirmPhoto = () => {
    this.props.onLabelSave(this.props.photo)
    emit(document, 'global:next-photo')
  }

  ignorePhoto = () => {
    this.props.onLabelSkip(this.props.photo)
    emit(document, 'global:next-photo')
  }

  viewNextPhoto = () =>{
    emit(document, 'global:next-photo')
  }

  viewPrevPhoto = () =>{
    emit(document, 'global:prev-photo')
  }

  getActionButtons(photo, selections) {
    const submitDisable = selections.length <= 0
    const photoDisable = !__.isEmpty(photo) && !photo.syncPhotoId
    const confirmButton = (
      <Button type="default" size="small" onClick={this.confirmPhoto} disabled={submitDisable || photoDisable}>
        <Icon type="save"/>
        <FormattedMessage id="footer.submit"/>
      </Button>)
    const skipButton = (
      <span style={{ paddingRight: '10px' }}><Button type="default" size="small" onClick={this.ignorePhoto}
        disabled={photoDisable}>
        <Icon component={SkipSvg}/>
        <FormattedMessage id="footer.skip"/>
      </Button></span>)

    return (<div className="toolbar-center" style={{ margin: 'auto' }}>
      <ToolGroup>
        <LRButton
          title="Alt+ArrowLeft"
          className="prev-button"
          icon={<IconChevron16/>}
          onClick={this.viewPrevPhoto}/>
        <div style={{ display: 'inline-block', paddingTop: '2px' }}>
          {photoDisable ?
            <Tooltip mouseLeaveDelay={0.01} mouseEnterDelay={0.01} arrowPointAtCenter placement="top" title={<FormattedMessage id="footer.noSyncMessage"/>}>
              {skipButton}
            </Tooltip> : skipButton }
          {photoDisable ?
            <Tooltip mouseLeaveDelay={0.01} mouseEnterDelay={0.01} arrowPointAtCenter placement="top" title={<FormattedMessage id="footer.noSyncMessage"/>}>
              {confirmButton}
            </Tooltip> : submitDisable ?
              <Tooltip mouseLeaveDelay={0.01} mouseEnterDelay={0.01} arrowPointAtCenter placement="top" title={<FormattedMessage id="footer.nothingMessage"/>}>
                {confirmButton}
              </Tooltip> : confirmButton }
        </div>
        <LRButton
          title="Alt+ArrowRight"
          className="next-button"
          icon={<IconChevron17/>}
          onClick={this.viewNextPhoto}/>
      </ToolGroup>
    </div>)
  }

  render() {
    const { photo, selections } = this.props
    let modifiedTime = ''
    if (photo) modifiedTime = moment(new Date(photo.modified)).tz(moment.tz.guess()).format('YYYY-MM-DD HH:mm:ss')

    return (
      <Toolbar isDraggable={false}>
        <ToolbarLeft>
          <div style={{ position: 'fixed', fontSize: '12px', display: 'flex' }}>
            <FormattedMessage id="footer.modified"/>:
            {(selections && selections.length > 0) ? `${moment(
              new Date(selections[selections.length - 1].updatedTime)).tz(moment.tz.guess())
              .format('YYYY-MM-DD HH:mm:ss')}` :
              `${modifiedTime}`}
            <ToolGroup>
              {photo ? <span>&nbsp;&nbsp;<Tag style={{ lineHeight: '16px', height: '18px' }} color={photo.workStatus === 0 ? '#f50' : photo.workStatus === 1 ? '#2db7f5' : '#87d068'}>    <FormattedMessage id={`footer.photoWorkStatus${photo.workStatus}`}/></Tag></span> : ''}
            </ToolGroup>
          </div>
        </ToolbarLeft>
        {this.getActionButtons(photo, selections)}
      </Toolbar>
    )
  }
  static propTypes = {
    photo: object,
    onLabelSave: func.isRequired,
    onLabelSkip: func.isRequired,
    selections: array.isRequired
  }
}

module.exports = {
  EsperFootToolbar
}
