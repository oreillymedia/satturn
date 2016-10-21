import React from 'react';
import Textarea from 'react-autosize-textarea';
import classnames from 'classnames';


export default class SimpleEditor extends React.Component {
  
  render() {
    var classes = classnames("st-simple-editor", {
      "st-simple-editor-monospaced" : this.props.monospaced
    })
    return (
      <Textarea
        className={classes}
        value={this.props.content}
        onChange={(e)=> this.props.onChange(e.target.value)}
      />
    );
  }
}