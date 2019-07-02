'use strict'

const { $$, parse } = require('../dom')
const { debug, info } = require('../common/log')
const { blank } = require('../common/util')
const { text } = require('../value')

module.exports = {
  xmp(buffer) {
    try {
      if (!blank(buffer)) {
        let input = strip(buffer).toString('utf-8')
        let doc = parse(input, 'application/xml')
        let data = {}

        if (!(/^xmpmeta$/i).test(doc.documentElement.localName)) {
          throw new Error('not an XMP meta document')
        }

        for (let prop of $$('Description > *', doc)) {
          let values = Array
            .from($$('li', prop), li => li.textContent)
            .filter(v => !blank(v))

          if (blank(values)) continue

          let id = [
            prop.lookupNamespaceURI(prop.prefix),
            prop.localName
          ].join('')

          data[id] = text(values.join('; '))
        }

        return data
      }
    } catch (error) {
      info(`XMP extraction failed: ${error.message}`)
      debug(error.stack)
    }
  }
}

function strip(buffer) {
  if (buffer[0] !== 60) {
    let offset = buffer.indexOf(0)
    if (offset >= 0) {
      buffer = buffer.slice(offset + 1)
    }
  }
  return buffer
}
