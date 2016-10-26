import React from 'react';


export default class Intro extends React.Component {
  
  render() {
    return (
      <div className="st-intro">
        <p>Welcome to Satturn. Here you can edit all the files on the project.</p>
        <p>Click on a file from the menu your left to open the editor.</p>
        <p>Changes are not currently being saved to the system, but they will. And it will be automatic.</p>
      </div>
    );
  }
}