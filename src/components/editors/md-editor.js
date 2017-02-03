import React from 'react'
import Editor from 'react-md-editor'
import md from '../../helpers/md'

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
      this.setState({ thebeInitialized : true })
      let thebe = new Thebe({
        selector:"pre[data-executable]",
        add_interrupt_button: true,
        kernel_name: "python3",
        tmpnb_mode: false,
        url: "http://" + window.location.host,
        debug: false,
      });
      window.thebe = thebe;
      $('.cm-s-default').addClass('cm-s-oreilly').removeClass('cm-s-default')
      
    }
  }
  refreshPage() {
    location.reload()
  }
  onChange(value) {
    if (!this.state.thebeInitialized) {
      this.setState({'content': value})
      this.props.onChange(value)
      this.setState({'output': this.markdownToHtml(value)});  
    }
    
  }
  markdownToHtml(input) {    
    return md.render(input);
  }
  render() {
    let {thebeInitialized} = this.state

      return (
        <div className={ thebeInitialized ? "editor-blocked" : null}>
          <div className="st-thebe-buttons">
            <button data-inactive={thebeInitialized ? true : null} onClick={()=>this.refreshPage()}>Markdown Preview</button>
            <button data-inactive={!thebeInitialized ? true : null} onClick={()=>this.initializeThebe()}>Runnable Code Cells</button>
          </div>
          
          <Editor
            value={this.state.content}
            onChange={ (v)=> (this.onChange(v))}
            options={this.CodeMirrorOptions}
            />
        <div className="MDOutput" dangerouslySetInnerHTML={{__html: this.state.output}}/>
        </div>
      )
  }
}

