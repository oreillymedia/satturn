import React from 'react'
import {connect} from 'react-redux'
import TreeView from 'react-treeview'
import classnames from 'classnames'

import {navigateTo}  from '../state/nav'
import {setSidebarActiveStatus} from '../state/nav'


export default connect((state) => state)( class FileIndex extends React.Component {
  onClick() {
    this.props.dispatch(setSidebarActiveStatus(true))
  }
  render() {
    let sidebarClasses = classnames( "st-file-index",{
      "st-file-index-collapsed" : !this.props.Nav.get('sidebarActiveStatus')
    })
    if (!this.props.Files.getIn(['tree','children'])) {
      return (<div className={sidebarClasses} >Loading...</div>)
    }
    let children = this.props.Files.getIn(['tree','children']).map( p => {
          return ( p.get('type') == 'directory' 
            ? <Folder key={p.get('path')} { ...p.toJS() } />
            : <File key={p.get('path')} { ...p.toJS() } />
          )
        })
    return (
      <div className={sidebarClasses} onClick={()=> this.onClick()}>
        <h2 className="st-project-name" >
        <i className="material-icons">folder_open</i> &nbsp;
          {this.props.Files.getIn(['tree','name'])}
        </h2>
        <div className="st-project-tree">
          {children}
        </div>
      </div>
    )
  }
})

export class Folder extends React.Component {
  render() { 
    let children = null;
    if (this.props.children) {
      children = this.props.children.map( (child, i)=> {
          return ( child.type == 'directory'
            ? <Folder key={child.path} {...child} />
            : <File key={child.path} {...child} />
            )
        })  
    }
    let classes = classnames( 'st-folder')
    
    return ( <TreeView nodeLabel={this.props.name} className={classes} defaultCollapsed={true} > 
      { children }
      </TreeView>
    );
  }
}

// Connected File
export const File = connect((state) => state)( class File extends React.Component {
  selectFile(path) {
    this.props.dispatch(navigateTo(path))
  }
  render() {
    let status;
    let isCurrent = this.props.path == this.props.Files.getIn(['current', 'path'])
    if (isCurrent) {
      status = this.props.Files.getIn(['current', 'status'])
      // console.log(status, this.props.path )
    }
    let icon = classnames({
      "autorenew" : (status == 'loading'),
      "save" : (status == 'saving'),
      "check" : (status == 'saved')
    })
    let iconClass = classnames('material-icons', {
      "icon-spinning" : (status == 'loading'),
      "icon-blinking" : (status == 'saving')
    })
    let classes = classnames( 'st-file', {
      "st-file-selected" : (isCurrent)
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

