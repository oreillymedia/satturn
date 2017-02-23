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
  isVideoIdValid(id){
    /[a-zA-Z0-9_-]{11}/.test(id)
  }
  render() {
    return (
      <div className="st-cue-annotator"> 
        {this.isVideoIdValid(this.props.videoId) ? null : <div className="banner"> Youtube Video Id doesn't seem to be valid. Please update in <a href="/#/oriole-settings">oriole settings</a> </div>}
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