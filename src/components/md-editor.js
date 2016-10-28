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
    this.setState({'output': this.markdownToHtml(value)});
    initializeThebe();
  }
  markdownToHtml(md) {
    let parsed = reader.parse(md);
    return writer.render(parsed);
  }
  render() {
     return (
        <div>
          {this.state.thebeInitialized 
            ? <button className="st-button-thebe" onClick={()=>this.refreshPage()}>Stop Thebe</button>
            : <button className="st-button-thebe" onClick={()=>this.initializeThebe()}>Start Thebe</button>
          }
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

