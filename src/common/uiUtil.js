'use strict'
const { notification } = require('antd')

const uiUtil = {

  openNotification(type, message, description) {
    notification[type]({
      message,
      description
    })
  }
}

module.exports = uiUtil
