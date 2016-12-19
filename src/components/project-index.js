import React from 'react'
import {connect} from 'react-redux'
import TreeView from 'react-treeview'
import classnames from 'classnames'

import {navigateTo}  from '../state/nav'
import {setSidebarActiveStatus} from '../state/nav'


export default connect( (state) => state)( class ProjectIndex extends React.Component {
  onClick() {
    this.props.dispatch(setSidebarActiveStatus(true))
  }
  render() {
    return (
      <div onClick={()=> this.onClick()}>
        <h2 className="st-project-name" >
        <i className="material-icons">folder_open</i> &nbsp;
          {this.props.Files.getIn(['tree','name'])}
        </h2>
        <div className="st-project-index">
          {this.props.Nav.get('index').map((el,i)=>
            <div key={i}>
              <a href={'#'+el.get('slug')}>{el.get('name')} </a>
            </div>)
        }
        </div>
      </div>
    )
  }
})