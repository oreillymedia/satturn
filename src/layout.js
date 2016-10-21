import React from 'react';
import {connect} from 'react-redux'
import {Link} from 'react-router'
import FileIndex from './components/file-index'
import Editor from './components/editor'

import {getTree} from './state/files'

const main = React.createClass({
  componentDidMount: function() {
    this.props.dispatch(getTree())
  },
  render: function () {
    return (
      <div>
        <header>
          <h1>Satturn</h1>
        </header>
        <main>
          <FileIndex {...this.props} />
          <Editor file={this.props.Files.get('current')} {...this.props} />
        </main>
        <footer>
          (c) 2016 Satturn File Editor
        </footer>
     </div>
    )
  }
})

//Map the local state directly to the state tree in the combined reducer.
export default connect((state) => state)(main);