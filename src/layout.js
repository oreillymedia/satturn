import React from 'react';
import {connect} from 'react-redux'
import FileIndex from './components/file-index'
import ProjectIndex from './components/project-index'
import Editor from './components/editor'
import Intro from './components/intro'
import {initialLoad} from './state/nav'


const main = React.createClass({
  componentDidMount: function() {
    this.props.dispatch(initialLoad())
  },
  render: function () {
    const {Nav} = this.props;
    let message = Nav.getIn(['status', 'message'])
    return (
      <div>
        <header>
          <h1>Oriole Editor</h1>
          <div className="st-status">{message}</div>
        </header>
        <main>
          
          {true ? <ProjectIndex {...this.props} /> : <FileIndex {...this.props} /> }
          { 
          Nav.getIn(['current', 'path'])
          ? 
          <Editor feature={Nav.getIn(Nav.getIn(['current', 'keyPath']))} {...this.props} /> 
          : 
          <Intro/>}
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