import React from 'react'
import {connect} from 'react-redux'
import classnames from 'classnames'

import {navigateTo, setSidebarActiveStatus} from '../state/nav'
import {treeUtils} from '../state/files'


export default connect( (state) => state)( class ProjectIndex extends React.Component {
  onClick() {
    this.props.dispatch(setSidebarActiveStatus(true))
  }
  render() {
    let sidebarClasses = classnames( "st-project-index",{
      "st-project-index-collapsed" : !this.props.Nav.get('sidebarActiveStatus')
    })
    return (
      <div onClick={()=> this.onClick()} className={sidebarClasses}>
        <h2 className="st-project-name" >
        <i className="material-icons">folder_open</i>&nbsp;{this.props.Files.getIn(['tree','name'])}
        </h2>
        <div className="st-project-tree">
          {this.props.Nav.get('index').map( (feat,i)=> <Item key={i} {...feat.toJS()} /> )}
        </div>
      </div>
    )
  }
})



// Connected Item
export const Item = connect((state) => state)( class Item extends React.Component {
  selectFile(path) {
    this.props.dispatch(navigateTo(path))
  }
  getFileStatus(path){
    let keyPath = treeUtils.find(this.props.Files, node => node.get('path') === path )
    return (keyPath) ? this.props.Files.getIn(keyPath.concat('status')) : false
  }
  render() {
    let isCurrent = this.props.path == this.props.Nav.getIn(['current', 'path'])
    
    let status = this.getFileStatus(this.props.resources[0].path)
    // if(isCurrent) console.log(this.props.resources[0].path, status)
    let icon = classnames({
      "autorenew" : (status == 'loading'),
      "save" : (status == 'saving'),
      "check" : (status == 'saved')
    })
    let iconClass = classnames('material-icons', {
      "icon-spinning" : (status == 'loading'),
      "icon-blinking" : (status == 'saving')
    })
    let classes = classnames( 'st-project-tree-item', {
      "st-project-tree-item-selected" : (isCurrent)
    })
    // console.log('icon: ', icon)
    return ( <div className={classes} onClick={() => this.selectFile(this.props.path) }> 
      {this.props.name} 
      <span className="icon-wrapper"> 
        <i className={iconClass}>{icon}</i>
      </span>
      </div> );
  }
})