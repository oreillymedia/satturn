import React from 'react';
import {connect} from 'react-redux'
import FileIndex from './components/file-index'
import Editor from './components/editor'
import Intro from './components/intro'
import {getTree} from './state/files'
import {watchHistoryChanges} from './state/nav'


const main = React.createClass({
  componentDidMount: function() {
    this.props.dispatch(getTree())
    this.props.dispatch(watchHistoryChanges())
  },
  render: function () {
    return (
      <div>
        <header>
          <h1>Satturn</h1>
        </header>
        <main>
          <FileIndex {...this.props} />
          {this.props.Files.getIn(['current', 'path']).length > 0 
          ? <Editor file={this.props.Files.get('current')} {...this.props} /> 
          : <Intro/>}
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