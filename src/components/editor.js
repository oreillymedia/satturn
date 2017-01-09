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
import AnnotatorEditor from './editors/annotator-editor'

import md from '../helpers/md'

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
      console.log('saving %s ...', path)
      return this.props.dispatch(saveFileToServer(path))
    }, 1000, {leading: false, trailing: true})

    this.throttledSave2 = throttle((path)=>{
      console.log('saving %s ...', path)
      return this.props.dispatch(saveFileToServer(path))
    }, 1000, {leading: false, trailing: true})
  }

  onChange(path, data, objectProp = false) {
    this.props.dispatch(setSidebarActiveStatus(false))

    if (objectProp) {
      this.props.dispatch(updateInJsonFile(path, data, objectProp))
    } else {
      this.props.dispatch(updateFile(path, {data: data}))  
    }
    this.throttledSave(path)

    // this is a bit hacky but works for now. on markdown editor we will also save the generated html file
    if (this.props.feature.get('editor') === 'markdown' ){
      let htmlContent = this.props.feature.get('resources').find( (r)=>r.get('ref') == 'htmlContent' )
      this.props.dispatch(updateFile(htmlContent.get('path'), {data: md.render(data)}))

      this.throttledSave2(htmlContent.get('path'))
    }
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
            if (this.props.Nav.getIn(['config', 'mode'] ) !== "markdown"  ) {
              return (<div> Editing mode is not set to Markdown. You could accidentally overwrite changes from pynb file. Please change mode in <a href="#/oriole-settings">Oriole Settings</a> to enable this editor.</div>)
            }
            if (resources.count() < 1 ) {
              return (<div> No content for this path </div>)
            }
            return (<MdEditor 
                      key={this.props.feature.get('path')} 
                      content={this.getResourceData(resources.first())}
                      onChange={ (data)=> 
                        this.onChange(resources.first().get('path'), data)
                      }
                      />)
          case "ormAnnotator":
            // validations here
            let cues = resources.find( (r)=>r.get('ref') == 'cues' )
            let html = resources.find( (r)=>r.get('ref') == 'htmlContent' )
            if (!cues || !html) return (<div> something went wront</div>)
            return (<AnnotatorEditor
              key={this.props.feature.get('path')} 
              content={ (this.getResourceData(cues)) }
              videoId={this.props.Nav.getIn(['config', 'videoId'])}
              htmlContent={this.getResourceData(html)}
              onChange={ (data)=> this.onChange(cues.get('path'), data, cues.get('ref'))}
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
        <h1>{this.props.feature.get('name') || "Welcome"}</h1>
        <div className="st-editor-area">{loaded ? editorSelector() : "Loading..."}</div>
      </div>
    )
  }
})


// LOCAL HELPERS


