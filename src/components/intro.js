import React from 'react';


export default class Intro extends React.Component {
  
  render() {
    return (
      <div className="st-intro">
        <h1>Welcome to the Oriole Editor</h1>
        <p>Use the sidebar to choose an editor. <br/>
        Changes will be saved automatically.</p>
      </div>
    );
  }
}