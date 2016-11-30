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
      lineWrapping: true,
      viewportMargin: Infinity,
    }
  }
  initializeThebe() {
     if (Thebe) {
      var thebe = new Thebe({
        selector:"pre[data-executable]",
        add_interrupt_button: true,
        kernel_name: "python3",
        tmpnb_mode: false,
        url: "http://" + window.location.host,
        debug: true,
      });
      $('.cm-s-default').addClass('cm-s-oreilly').removeClass('cm-s-default')
      this.setState({'thebeInitialized': true})
    }
  }
  refreshPage() {
    location.reload()
  }
  onChange(value) {
    this.setState({'content': value})
    this.props.onChange(value)
    if (!this.state.thebeInitialized) {
      this.setState({'output': this.markdownToHtml(value)});  
    }
    
  }
  markdownToHtml(md) {
    let parsed = reader.parse(md);
    return writer.render(parsed);
  }
  render() {
     return (
        <div>
          <div className="st-thebe-buttons">
            <button disabled={!this.state.thebeInitialized} onClick={()=>this.refreshPage()}>Live Preview</button>
            <button disabled={this.state.thebeInitialized} onClick={()=>this.initializeThebe()}>Run Code</button>
          </div>
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

