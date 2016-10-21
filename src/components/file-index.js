import React from 'react'
import {connect} from 'react-redux'
import TreeView from 'react-treeview'
import classnames from 'classnames'

import {getFile}  from '../state/files'

export default class FileIndex extends React.Component {
  
  render() {
    if (!this.props.Files.getIn(['tree','children'])) {
      return (<div>Loading...</div>)
    }
    let children = this.props.Files.getIn(['tree','children']).map( p => {
          return ( p.get('type') == 'directory' 
            ? <Folder key={p.get('path')} { ...p.toJS() } />
            : <File key={p.get('path')} { ...p.toJS() } />
          )
        })
    return (
      <div className="st-file-index">
        <h2>{this.props.Files.getIn(['tree','name'])}</h2>
        {children}
      </div>
    )
  }
}

export class Folder extends React.Component {
  render() { 
    let children = this.props.children.map( (child, i)=> {
        return ( child.type == 'directory'
          ? <Folder key={child.path} {...child} />
          : <File key={child.path} {...child} />
          )
      })
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
    this.props.dispatch(getFile(path))
  }
  render() {
    let classes = classnames( 'st-file', {
      "st-file-selected" : (this.props.path == this.props.Files.getIn(['current', 'path']))
    })
    return ( <div className={classes} onClick={() => this.selectFile(this.props.path) }> {this.props.name} </div> );
  }
})

