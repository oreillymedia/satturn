import React from 'react'
import {connect} from 'react-redux'
import TreeView from 'react-treeview'

import DraftEditor from './draft-editor'
import JsonEditor from './json-editor'

export default connect((state) => state)( class Editor extends React.Component {
  
  render() {
    let file = this.props.file.get('path').split('/').pop()
    let chooseEditor = ()=> {
        switch(true){
          case /.md$/.test(file):
            return (<DraftEditor key={this.props.file.get('path')} initialMdContent={this.props.file.get('data')}/>)
          case /.html$/.test(file):
            return (<DraftEditor key={this.props.file.get('path')} initialHtmlContent={this.props.file.get('data')}/>)
          default:
            return (<SimpleEditor key={this.props.file.get('path')} initialHtmlContent={this.props.file.get('data')}/>)
        }
        return 'no editor for this file :('
    }
    return (
      <div className="st-editor">
        <h1>{this.props.file.get('path')}</h1>
        <h2>{extension}</h2>
        {chooseEditor()}
      </div>
    )
  }
})
