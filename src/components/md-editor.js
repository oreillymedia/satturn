import React from 'react'
import Editor from 'react-md-editor'
import commonmark from 'commonmark'

const reader = new commonmark.Parser();
const writer = new commonmark.HtmlRenderer();

export default class MdEditor extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      content: props.content,
      output: this.markdownToHtml(props.content)
    }
    this.CodeMirrorOptions = {
      theme:"satturn", 
      viewportMargin: Infinity,
    }
  }
  onChange(value) {
    this.setState({'content': value})
    this.props.onChange(value)
    this.setState({'output': this.markdownToHtml(value)}); 
  }
  markdownToHtml(md) {
    let parsed = reader.parse(md);
    return writer.render(parsed);
  }
  render() {
     return (
        <div>
          <Editor
            value={this.state.content}
            onChange={ (v)=> this.onChange(v)}
            options={this.CodeMirrorOptions}
            />
        <div className="MDOutput" dangerouslySetInnerHTML={{__html: this.state.output}}/>
        </div>
      )
  }
}

