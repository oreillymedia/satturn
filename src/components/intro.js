import React from 'react';


export default class Intro extends React.Component {
  
  render() {
    return (
      <div className="st-intro">
        <p>Welcome to Satturn file editor. Here you can edit all the files on this project.</p>
        <p>Select a file from the menu your left to open the editor.</p>
        <p>Changes will be saved automatically.</p>
      </div>
    );
  }
}