'use strict'

const React = require('react')
const { Component } = React
const { Modal } = require('antd')

const axios = require('axios')
const { func, bool } = require('prop-types')
const { FormattedMessage, intlShape, injectIntl } = require('react-intl')

class MessageBox extends Component {

  state = { userType: 0 };

  render() {
    return (
      <Modal
        destroyOnClose
        title={<FormattedMessage id="contacts.friend"/>}
        visible={this.props.modalVisible}
        footer={null}
        onCancel={() => this.props.handleModalVisible(false)} />
    )
  }

  static propTypes = {
    intl: intlShape.isRequired,
    modalVisible: bool.isRequired,
    handleModalVisible: func.isRequired
  }
}

module.exports = {
  MessageBox: injectIntl(MessageBox)
}
