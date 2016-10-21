import React from 'react'
import {connect} from 'react-redux'
import TreeView from 'react-treeview'

import {saveCurrentFile} from '../state/files'

import Intro from './intro'

import DraftEditor from './draft-editor'
import JsonEditor from './json-editor'
import SimpleEditor from './simple-editor'

export default connect((state) => state)( class Editor extends React.Component {
  onChange (data) {
    this.props.dispatch(saveCurrentFile(data))
  }
  render() {
    let file = this.props.file.get('path').split('/').pop()
    let extension = (file.split('.').length > 1 ) ? file.split('.').pop() : false;
    let dotfile = /^\./.test(file)
    let chooseEditor = ()=> {
        switch(true){
          case /.md$/.test(file):
            return (<DraftEditor key={this.props.file.get('path')} initialMdContent={this.props.file.get('data')}/>)
          case /.html$/.test(file):
            return (<DraftEditor key={this.props.file.get('path')} initialHtmlContent={this.props.file.get('data')}/>)
          case /.json$/.test(file):
            return (<JsonEditor key={this.props.file.get('path')} initialContent={this.props.file.get('data')}/>)
          case file.length > 0:
            return (<SimpleEditor 
                      key={this.props.file.get('path')} 
                      monospaced={!extension || dotfile}
                      content={this.props.file.get('data')} 
                      onChange={ (data)=> this.onChange(data)}
                      />)
        }
        return <Intro/>
    }
    return (
      <div className="st-editor">
        <h1>{file || "Welcome"}</h1>
        {chooseEditor()}
      </div>
    )
  }
})
