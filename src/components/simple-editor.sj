import React from 'react';

export default class SimpleEditor extends React.Component {
  onChange(value) {
    console.log(value)
  }
  render() {
    return (
      <div content-editable=true value= onChange={this.onChange}>
        {props.initialContent}
      <div/>
    );
  }
}