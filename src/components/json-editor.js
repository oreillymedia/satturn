import React from 'react';
import Json from 'react-json'


var settings = {
  form: true,
  fields: { password: {type: 'password'} }
};

export default class JsonEditor extends React.Component {
  onChange(value) {
    console.log(value)
  }
  render() {
    return (
      <Json value={props.initialContent} onChange={this.onChange}/>
    );
  }
}