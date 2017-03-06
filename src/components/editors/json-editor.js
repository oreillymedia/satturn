import React from 'react';
import Json from 'react-json'


export default class JsonEditor extends React.Component {
  onChange(value) {
    this.props.onChange(JSON.stringify(value, null, 2))
  }
  render() {
    return (
      <div>
        <p>Press enter to save changes to a field.</p>      
        <Json 
          value={JSON.parse(this.props.content)} 
          onChange={ (v)=> this.onChange(v)}
          settings={this.props.settings}
          />
          
      </div>
    );
  }
}