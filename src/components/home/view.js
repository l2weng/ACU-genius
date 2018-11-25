// 'use strict'
//
// const React = require('react')
// const { PureComponent } = React
// const { PROJECT: { MODE } } = require('../../constants')
//
// const {
//    bool,  string
// } = require('prop-types')
//
//
// class HomeView extends PureComponent {
//   constructor(props) {
//     super(props)
//   }
//
//   get isHomeOpen() {
//     return this.props.mode === MODE.HOME
//   }
//
//   get offset() {
//     return (this.isHomeOpen ^ this.props.isModeChanging) ?
//       0 : 'calc(-100%)'
//   }
//
//   get style() {
//     return { transform: `translate3d(${this.offset}, 0, 0)` }
//   }
//
//   render() {
//
//     return (
//       <section className="item-view" style={this.style}>
//        I am home page!
//       </section>
//     )
//   }
//
//
//   static propTypes = {
//     mode: string.isRequired,
//     isModeChanging: bool.isRequired,
//   }
// }
//
// module.exports = {
//   HomeView
// }
