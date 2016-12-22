import React from 'react'
import {connect} from 'react-redux'
import TreeView from 'react-treeview'
import classnames from 'classnames'
import throttle from 'lodash.throttle'

import {updateFile, saveFileToServer, updateInJsonFile, treeUtils} from '../state/files'
import {setSidebarActiveStatus} from '../state/nav'

import Intro from './intro'
import DraftEditor from './editors/draft-editor'
import MdEditor from './editors/md-editor'
import JsonEditor from './editors/json-editor'
import SimpleEditor from './editors/simple-editor'
import Annotator from '@oreillymedia/annotator'

export default connect((state) => state)( class Editor extends React.Component {
  

  getResourceData(res){
    if ( ['url', 'urlInProp'].includes( res.get('type') ) ) {
      let keyPath = treeUtils.find(this.props.Files, node => node.get('path') === res.get('path') )
      return (keyPath) ? this.props.Files.getIn(keyPath.concat('data')) : false
    } else if ( res.get('type') == 'prop' ) {
      let keyPath = this.props.Nav.get('configKeyPath')
      try {
          let data = this.props.Files.getIn(keyPath.concat('data'))
          let c = JSON.parse(data);
          return JSON.stringify(c[res.get('ref')])
      } catch(e) {
          throw new Error(e); // error in the above string (in this case, yes)!
      }

    }
      
  }
  didFileLoad(path){
    let keyPath = treeUtils.find(this.props.Files, node => node.get('path') === path )
    return (keyPath) ? this.props.Files.getIn(keyPath.concat('loaded')) : false
  }


  componentWillMount() {
    this.throttledSave = throttle((path)=>{
      console.log('saving...')
      return this.props.dispatch(saveFileToServer(path))
    }, 1000, {leading: false, trailing: true})
  }

  onChange(path, data, objectProp = false) {
    if (objectProp) {
      this.props.dispatch(updateInJsonFile(path, data, objectProp))
    } else {
      this.props.dispatch(updateFile(path, {data: data}))  
    }
    this.props.dispatch(setSidebarActiveStatus(false))
    this.throttledSave(path)
  }
  render() {
    let resources = this.props.feature.get('resources')
    let loaded = resources.every( res=> res.has('path') ? this.didFileLoad(res.get('path')) : true );
    let editorSelector = ()=> {
        switch(this.props.feature.get('editor')){
          case "json":
            if (resources.count() < 1 ) return (<div> No content for this path </div>)
            return (<JsonEditor 
                      key={this.props.feature.get('path')} 
                      content={this.getResourceData(resources.first())}
                      onChange={ (data)=> this.onChange(resources.first().get('path'), data)}
                      />)
          case "markdown":
            if (this.props.Nav.getIn('config', ) !== "markdown"  ) return (<div> Editing mode is not set to Markdown. You could overwrite changes from pynb file. Please change mode in <a href="#/oriole-settings">Oriole Settings</a> </div>)
            if (resources.count() < 1 ) return (<div> No content for this path </div>)
            return (<MdEditor 
                      key={this.props.feature.get('path')} 
                      content={this.getResourceData(resources.first())}
                      onChange={ (data)=> this.onChange(resources.first().get('path'), data)}
                      />)
          case "ormAnnotator":
            // validations here
            let cues = resources.find( (r)=>r.get('ref') == 'cues' )
            let html = resources.find( (r)=>r.get('ref') == 'htmlContent' )
            if (!cues || !html) return (<div> something went wront</div>)
            return (<div className="st-cue-annotator"> 
                      { <Annotator 
                          key={this.props.feature.get('path')} 
                          content={ (this.getResourceData(cues)) }
                          videoId={this.props.Nav.getIn(['config', 'videoId'])}
                          htmlContent={this.getResourceData(html)}
                          onChange={ (data)=> this.onChange(cues.get('path'), data, cues.get('ref'))}
                        />
                      }
                    </div>)



          // case "main.md" == file:
          //   return (<MdEditor key={this.props.file.get('path')} 
          //     content={this.props.file.get('data')}
          //     onChange={ (data)=> this.onChange(data)}
          //     />)
          // case "cues.json" == file:
          //   return (<div className="st-cue-annotator"> 
          //             Rune's Cue Editor:
          //             { (extraFile.get('valid')) ? <Annotator key={this.props.file.get('path')} 
          //               content={this.props.file.get('data')}
          //               videoId="FAM1N1APk80"
          //               htmlContent={extraFile.get('data')}
          //               onChange={ (data)=> this.onChange(data)}
          //             /> : "loading..."}
          //           </div>)
          // 
          // case /\.(html)$/.test(file):
          //   return (<DraftEditor key={this.props.file.get('path')} 
          //             content={this.props.file.get('data')}
          //             type={extension}
          //             onChange={ (data)=> this.onChange(data)}
          //             />)
          
          // case /\.(jpe?g|png|psd|tift?|gif|svg)$/.test(file):
          //   return (<div className="st-image-preview"><img src={"/files/" + this.props.file.get('path')}/></div>)
          // case file.length > 0:
          //   var mono = !extension || dotfile || (['sh', 'js', 'css', 'scss', 'conf'].indexOf(extension) > -1);
          //   return (<SimpleEditor 
          //             key={this.props.file.get('path')} 
          //             monospaced={mono}
          //             content={this.props.file.get('data')} 
          //             onChange={ (data)=> this.onChange(data)}
          //             />)
          



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
        <h1>{this.props.feature.get('name') || "Welcome"}</h1>
        <div className="st-editor-area">{loaded ? editorSelector() : "Loading..."}</div>
      </div>
    )
  }
})


// LOCAL HELPERS


