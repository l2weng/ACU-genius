'use strict'
const OSS = require('ali-oss')
const fs = require('fs')

const dataUtil = {
  /**
   * get the graphQl parameters
   * @param {object} params
   * @param arr
   * @returns {string}
   */
  getUrlFilterParams(params, arr) {
    let paramObj = []
    let queryParams = ''

    if (params) {
      const paramKey = Object.keys(params)
      const paramValue = Object.values(params)

      for (let i in paramKey) {
        if (arr.indexOf(paramKey[i]) > -1 && paramValue[i] !== '' && typeof (paramValue[i]) !== 'undefined') {
          paramObj.push(i)
        }
      }

      if (paramObj.length > 0) {
        for (let j in paramObj) {
          let paramValueJ = null
          switch (typeof (paramValue[paramObj[j]])) {
            case 'string':
              paramValueJ = `"${paramValue[paramObj[j]]}"`
              break
            case 'object':
              if (paramValue[paramObj[j]] instanceof Array) {
                paramValueJ = '['
                paramValue[paramObj[j]].map((item) => {
                  paramValueJ = paramValueJ + `"${item}" `
                })
                paramValueJ = paramValueJ + ']'
              }
              break
            default:
              paramValueJ = paramValue[paramObj[j]]
              break
          }
          queryParams = queryParams + `${paramKey[paramObj[j]]}: ${paramValueJ} `
        }
        queryParams = `(${queryParams})`
      }
    }

    return queryParams
  },

  getNewOOSClient() {
    return new OSS({
      region: 'oss-cn-shanghai',
      accessKeyId: 'LTAIHmYSWuHcT5xd',
      accessKeySecret: 'JS0Uub4G47eOwXw70EDmby0knaqDbh',
      bucket: 'labelreal'
    })
  },

  getOSSOjbectName(url) {
    return (/[^/]*$/).exec(url)[0]
  },

  getFilesizeInBytes(filename) {
    let stats = fs.statSync(filename)
    return stats['size']
  },

  getTaskStatusDesc(status = 0, lang = 'en') {
    switch (status) {
      case 0:
        return 'open'
      case 1:
        return 'working'
      case 2:
        return 'complete'
      case 3:
        return 'confirmed'
    }
  },

  getTaskStatusBadge(status = 0, lang = 'en') {
    switch (status) {
      case 0:
        return 'default'
      case 1:
        return 'processing'
      case 2:
        return 'warning'
      case 3:
        return 'success'
    }
  },

  getTaskStatusTooltip(status = 0, lang = 'en') {
    switch (status) {
      case 0:
        return '未开始'
      case 1:
        return '进行中'
      case 2:
        return '任务审核中'
      case 3:
        return '已完成'
    }
  },
}

module.exports = dataUtil
