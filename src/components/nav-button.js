import React from 'react'
import classNames from 'classnames'
import {setRoute} from '../state'

export const NavButton = React.createClass({
  buttonClicked: function() {
    this.props.dispatch(setRoute(this.props.route_name))
  },
  openExternalLink: function() {
    window.open(this.props.externalLink)
  },
  render: function() {
    let classes = classNames(this.props.className, "nav-item", {
      "nav-item-current" : this.props.route_name === this.props.current_route
    })
    return (
      <span
        onClick={this.props.externalLink ? this.openExternalLink : this.buttonClicked} className={classes} >
        { this.props.label }
      </span>
    )
  }
})
