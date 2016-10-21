import React from 'react';
import Json from 'react-json'


var settings = {
  // form: true,
  // fields: { password: {type: 'password'} }
};

export default class JsonEditor extends React.Component {
  onChange(value) {
    this.props.onChange(JSON.stringify(value))
  }
  render() {
    return (
      <Json 
        value={JSON.parse(this.props.content)} 
        settings={ settings }
        onChange={ (v)=> this.onChange(v)}/>
    );
  }
}