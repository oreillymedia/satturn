import React from 'react'
import {connect} from 'react-redux'
import TreeView from 'react-treeview'
import classnames from 'classnames'
import throttle from 'lodash.throttle'

import {updateCurrentFileData, saveCurrentFileToServer} from '../state/files'
import {setSidebarActiveStatus} from '../state/nav'

import Intro from './intro'
import DraftEditor from './editors/draft-editor'
import MdEditor from './editors/md-editor'
import JsonEditor from './editors/json-editor'
import SimpleEditor from './editors/simple-editor'
import Annotator from '@oreillymedia/annotator'

export default connect((state) => state)( class Editor extends React.Component {
  componentWillMount() {
    this.throttledSave = throttle(()=>{
      console.log('saving...')
      return this.props.dispatch(saveCurrentFileToServer())
    }, 1000, {leading: false, trailing: true})
  }
  onChange(data) {
    this.props.dispatch(updateCurrentFileData(data))
    this.props.dispatch(setSidebarActiveStatus(false))
    this.throttledSave()
  }
  render() {
    console.log(this.props.resources.toJS())
    let file = this.props.file.get('path').split('/').pop()
    let extension = (file.split('.').length > 1 ) ? file.split('.').pop() : false;
    let isValid = this.props.file.get('valid')
    let dotfile = /^\./.test(file)
    let extraFile = this.props.Files.get('extra')
    
    let chooseEditor = ()=> {
        switch(true){
          case "main.md" == file:
            return (<MdEditor key={this.props.file.get('path')} 
              content={this.props.file.get('data')}
              onChange={ (data)=> this.onChange(data)}
              />)
          case "cues.json" == file:
            return (<div className="st-cue-annotator"> 
                      Rune's Cue Editor:
                      { (extraFile.get('valid')) ? <Annotator key={this.props.file.get('path')} 
                        content={this.props.file.get('data')}
                        videoId="FAM1N1APk80"
                        htmlContent={extraFile.get('data')}
                        onChange={ (data)=> this.onChange(data)}
                      /> : "loading..."}
                    </div>)
          case /\.(md)$/.test(file):
            return (<MdEditor key={this.props.file.get('path')} 
                      content={this.props.file.get('data')}
                      onChange={ (data)=> this.onChange(data)}
                      />)
          case /\.(html)$/.test(file):
            return (<DraftEditor key={this.props.file.get('path')} 
                      content={this.props.file.get('data')}
                      type={extension}
                      onChange={ (data)=> this.onChange(data)}
                      />)
          case /\.json$/.test(file):
            return (<JsonEditor 
                      key={this.props.file.get('path')} 
                      content={this.props.file.get('data')}
                      onChange={ (data)=> this.onChange(data)}
                      />)
          case /\.(jpe?g|png|psd|tift?|gif|svg)$/.test(file):
            return (<div className="st-image-preview"><img src={"/files/" + this.props.file.get('path')}/></div>)
          case file.length > 0:
            var mono = !extension || dotfile || (['sh', 'js', 'css', 'scss', 'conf'].indexOf(extension) > -1);
            return (<SimpleEditor 
                      key={this.props.file.get('path')} 
                      monospaced={mono}
                      content={this.props.file.get('data')} 
                      onChange={ (data)=> this.onChange(data)}
                      />)
          default:
            return <div>Loading...</div>
        }
        return <Intro/>
        
    }
    let editorClass = classnames("st-editor", {
      "st-editor-expanded" : !this.props.Nav.get('sidebarActiveStatus')
    })
    return (
      <div className={editorClass} onClick={()=> this.props.dispatch(setSidebarActiveStatus(false))}>
        <h1>{file || "Welcome"}</h1>
        <div className="st-editor-area">{isValid ? chooseEditor() : "Loading..."}</div>
      </div>
    )
  }
})
