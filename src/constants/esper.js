'use strict'

module.exports = {
  RESTORE: 'esper.restore',
  UPDATE: 'esper.update',


  MODE: {
    FIT: 'fit',
    FILL: 'fill',
    ZOOM: 'zoom'
  },

  TOOL: {
    ARROW: 'arrow',
    PAN: 'pan',
    SELECT: 'select',
    ZOOM_IN: 'zoomIn',
    ZOOM_OUT: 'zoomOut'
  },

  COLOR: {
    mask: {
      line: [0xffffff, 1],
      fill: [0x000000, 0.4]
    },
    selection: {
      default: {
        line: [0x5c93e5, 1],
        fill: [0xcedef7, 0.4]
      },
      active: {
        line: [0x5c93e5, 1],
        fill: [0xcedef7, 0.8]
      },
      live: {
        line: [0x5c93e5, 1],
        fill: [0xcedef7, 0.8]
      }
    }
  },

  getSelectionColors(lineColor = '5c93e5') {
    lineColor = lineColor.replace(/\#/g, '')
    return {
      mask: {
        line: [`0x${lineColor}`, 2],
        fill: [0x000000, 0.4]
      },
      selection: {
        default: {
          line: [`0x${lineColor}`, 2],
          fill: [`0x${lineColor}`, 0.2]
        },
        active: {
          line: [`0x${lineColor}`, 2],
          fill: [`0x${lineColor}`, 0.4]
        },
        live: {
          line: [`0x${lineColor}`, 2],
          fill: [`0x${lineColor}`, 0.4]
        }
      }
    }
  }
}
