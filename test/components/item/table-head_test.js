'use strict'

const React = require('react')
const { shallow } = require('enzyme')

describe.skip('ItemTableHead', () => {
  const { ItemTableHead } = __require('components/item/table-head')

  it('has class table-head', () => {
    expect(shallow(<ItemTableHead columns={[]}/>))
      .to.have.className('table-head')
  })

  it('renders head columns', () => {
    const columns = [
      { width: '40%', property: { id: 'x', type: 'string' } },
      { width: '60%', property: { id: 'y', type: 'number' } },
    ]

    const sort = {
      column: 'y', asc: true, type: 'property'
    }

    expect(shallow(<ItemTableHead columns={columns} sort={sort}/>))
      .to.have.exactly(2).descendants('ItemTableHeadCell')
  })
})
