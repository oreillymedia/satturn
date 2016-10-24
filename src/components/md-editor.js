import React from 'react'
import Editor from 'react-md-editor'
import {MarkdownEditor} from 'react-markdown-editor'


export default class MdEditor extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      content: props.content
    }
    this.CodeMirrorOptions = {
      theme:"satturn", 
      viewportMargin: Infinity,
    }
  }
  onChange(value) {
    this.setState({'content': value})
    this.props.onChange(value)
  }
  render() {
     return ( <Editor
          value={this.state.content}
          onChange={ (v)=> this.onChange(v)}
          options={this.CodeMirrorOptions}
          /> )
  }
}

