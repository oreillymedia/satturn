import React from 'react';
import Json from 'react-json'


export default class JsonEditor extends React.Component {
  onChange(value) {
    this.props.onChange(JSON.stringify(value))
  }
  render() {
    return (
      <Json 
        value={JSON.parse(this.props.content)} 
        onChange={ (v)=> this.onChange(v)}/>
    );
  }
}