import React from 'react'
import {connect} from 'react-redux'
import TreeView from 'react-treeview'
import classnames from 'classnames'

import {updateCurrentFile, ROOT} from '../state/files'
import {setSidebarActiveStatus} from '../state/nav'

import Intro from './intro'
import DraftEditor from './draft-editor'
import MdEditor from './md-editor'
import JsonEditor from './json-editor'
import SimpleEditor from './simple-editor'

export default connect((state) => state)( class Editor extends React.Component {
  onChange(data) {
    this.props.dispatch(updateCurrentFile(data))
    this.props.dispatch(setSidebarActiveStatus(false))
  }
  render() {
    let file = this.props.file.get('path').split('/').pop()
    let extension = (file.split('.').length > 1 ) ? file.split('.').pop() : false;
    let dotfile = /^\./.test(file)
    let chooseEditor = ()=> {
        switch(true){
          case /.(jpe?g|png|psd|tift?|gif|svg)$/.test(file):
            return (<div className="st-image-preview"><img src={ROOT + this.props.file.get('path')}/></div>)
          case /.(md)$/.test(file):
            return (<MdEditor key={this.props.file.get('path')} 
                      content={this.props.file.get('data')}
                      onChange={ (data)=> this.onChange(data)}
                      />)
          case /.(html)$/.test(file):
            return (<DraftEditor key={this.props.file.get('path')} 
                      content={this.props.file.get('data')}
                      type={extension}
                      onChange={ (data)=> this.onChange(data)}
                      />)
          case /cues.json$/.test(file):
            return (<div> Rune's Cue Editor </div>)
          case /.json$/.test(file):
            return (<JsonEditor 
                      key={this.props.file.get('path')} 
                      content={this.props.file.get('data')}
                      onChange={ (data)=> this.onChange(data)}
                      />)
          
          case file.length > 0:
            var mono = !extension || dotfile || (['sh', 'js', 'css', 'scss', 'conf'].indexOf(extension) > -1);
            return (<SimpleEditor 
                      key={this.props.file.get('path')} 
                      monospaced={mono}
                      content={this.props.file.get('data')} 
                      onChange={ (data)=> this.onChange(data)}
                      />)
        }
        return <Intro/>
    }
    let editorClass = classnames("st-editor", {
      "st-editor-expanded" : !this.props.Nav.get('sidebarActiveStatus')
    })
    return (
      <div className={editorClass}>
        <h1>{file || "Welcome"}</h1>
        <div className="st-editor-area">{chooseEditor()}</div>
      </div>
    )
  }
})
