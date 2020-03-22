'use strict'

const { TYPE, PHOTO } = require('./constants')
const edtf = require('edtf')
const { blank } = require('./common/util')

const format = {
  datetime(value, options = DTF) {
    try {
      if (blank(value)) return value
      const date = (value instanceof Date) ? value : edtf(value)

      if (date.getUTCFullYear() < 1300) {
        options = { ...options, era: 'short' }
      }
      //todo temporarily use de for zh
      return edtf.format(date, ARGS.locale === 'de' ? 'zh' : ARGS.locale, options)

    } catch (error) {
      return value
    }
  },

  number(value) {
    return fmtNumber(value)
  },

  bytes(value) {
    if (typeof value === 'string') value = parseInt(value, 10)
    if (!Number.isFinite(value)) return null

    let mag = Math.abs(value)
    let unit = (mag >= size.TB) ?
        'TB' : (mag >= size.GB) ?
        'GB' : (mag >= size.MB) ?
        'MB' : (mag >= size.kB) ?
        'kB' : 'bytes'

    return `${format.number(value / size[unit])} ${unit}`
  },

  status(value, locale = ARGS.locale) {
    if (typeof value === 'string') value = parseInt(value, 10)
    if (!Number.isFinite(value)) return null
    return PHOTO.STATUS[locale][value]
  },

  auto(value, type) {
    switch (type) {
      case TYPE.DATE:
        return format.datetime(value)
      case TYPE.NUMBER:
        return format.number(value)
      case TYPE.FILE_SIZE:
        return format.bytes(value)
      case TYPE.WORK_STATUS:
        return format.status(value)
      default:
        return value
    }
  }
}

function fmtNumber(value, locale = ARGS.locale) {
  if (!(locale in fmtNumber)) {
    fmtNumber[locale] =  new Intl.NumberFormat(locale, {
      maximumFractionDigits: 2
    })
  }

  return fmtNumber[locale].format(value)
}

const DTF = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric'
}

const size = {
  bytes: 1,
  kB: 1 << 10,
  MB: 1 << 20,
  GB: 1 << 30,
  TB: (1 << 30) * 1024
}

module.exports = format
