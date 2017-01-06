import React from 'react';
import Annotator from '@oreillymedia/annotator'


export default class AnnotatorEditor extends React.Component {
  
  adjustOffset (){
    let bar = document.querySelector('.top-bar')
    if (bar) {
      // should it offset?
      let scroll = document.body.scrollTop;
      let objectTop = Math.round(bar.getBoundingClientRect().top)
      let newObjectTop = Math.max(0, 110 - scroll)
      if (objectTop > 0 || newObjectTop > 0) {
        bar.style.top = newObjectTop + "px"
      }  
    }
  }
  componentDidMount(){
    this.adjustOffset()
    window.addEventListener("scroll", this.adjustOffset);
  }
  componentWillUnmount() {
    window.removeEventListener("scroll", this.adjustOffset);
  }

  render() {
    return (
      <div className="st-cue-annotator"> 
        { <Annotator 
            content={ this.props.content }
            videoId={ this.props.videoId }
            htmlContent={ this.props.htmlContent }
            onChange={ this.props.onChange }
          />
        }
      </div>
    );
  }
}