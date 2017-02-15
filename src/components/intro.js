import React from 'react';


export default class Intro extends React.Component {
  
  render() {
    return (
      <div className="st-intro">
        <h1>Welcome to the Oriole Authoring tool</h1>
        <p>Choose an editor from the menu on the left to <br/>adjust settings or edit the content.</p>
        <p>All changes will be saved automatically.</p>
      </div>
    );
  }
}