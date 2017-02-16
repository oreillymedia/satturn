import React from 'react';


export default class Intro extends React.Component {
  
  render() {
    return (
      <div className="st-intro">
        <h1>Welcome to {this.props.name}</h1>
        <div dangerouslySetInnerHTML={{__html : this.props.message}} />
      </div>
    );
  }
}