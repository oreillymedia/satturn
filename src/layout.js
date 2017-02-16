import React from 'react';
import {connect} from 'react-redux'
import FileIndex from './components/file-index'
import ProjectIndex from './components/project-index'
import Editor from './components/editor'
import Intro from './components/intro'
import {initialLoad} from './state/nav'
import {treeUtils} from './state/files'


const main = React.createClass({
  componentDidMount: function() {
    this.props.dispatch(initialLoad())
  },
  render: function () {
    const {Nav, Files} = this.props;
    let keyPath = treeUtils.find(Files, node => node.get('message') && node.get('message').length > 3 )
    let globalMessage = Nav.getIn(['status', 'message'])
    let fileMessage = (keyPath) ? Files.getIn(keyPath.concat('message')) : null
    return (
      <div>
        <header>
          <h1>{Nav.get('name')}</h1>
          <div className="st-status">{fileMessage} {globalMessage}</div>
        </header>
        <main>
          
          {true ? <ProjectIndex {...this.props} /> : <FileIndex {...this.props} /> }
          { 
          Nav.getIn(['current', 'path'])
          ? 
          <Editor feature={Nav.getIn(Nav.getIn(['current', 'keyPath']))} {...this.props} /> 
          : 
          <Intro name={Nav.get('name')} message={Nav.get('message')}/>}
        </main>
        <footer style={{display: 'none'}}>
          (c) 2016 Satturn File Editor
        </footer>
     </div>
    )
  }
})

//Map the local state directly to the state tree in the combined reducer.
export default connect((state) => state)(main);