/*********************************************************************
||  Import required modules
*********************************************************************/
import {Seq, fromJS, Map} from 'immutable'
import createHistory from 'history/createHashHistory' 
import {getTree, fetchFile, treeUtils} from './files'
import {store} from '../'

export const History = createHistory()

/*********************************************************************
||  Define the state tree
*********************************************************************/
export const INITIAL_STATE = fromJS({
  sidebarActiveStatus: true,
  currentPath: "",
  configFile: "oriole.json",
  index:[
    {slug: "markdown", name: "Markdown Editor",  editor: "markdown", resources: [
      {type:'urlref', ref:'source'}
      ]},
    {slug: "annotator", name: "Cue Annotator",  editor: "ormAnnotator", resources: [
      {type:'urlref', ref:'htmlContent'},
      {type:'ref', ref:'cues'}
      ]},
    {slug: "oriole-settings", name: "Oriole Settings", editor: "json", resources: [
      {type: 'file', ref: "oriole.json"}
      ]},
    {slug: "atlas-settings", name: "Atlas Settings", editor: "json", resources: [
      {type: 'file', ref:'atlas.json'}
      ]},
  ], 
  status: {
    status: 'ok',
    message: ''
  },
})

/*********************************************************************
||  The reducer
*********************************************************************/
export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case "setConfig":
      return state.set('config', action.config)
    case "setCurrentPath":
      return state.set('currentPath', action.path)
    case "selectEditor":
      return state.setIn(action.keyPath.concat('selected'), true )
    case "setSidebarActiveStatus":
      return state.set("sidebarActiveStatus", action.status)
    case "updateStatusBar":
      return state.update('status', (status)=> status.merge({status: action.status, message: action.message, timer: action.timer}))
  }
  return state;
}

/*********************************************************************
||  Actions
*********************************************************************/


export function initialLoad() { 
  return (dispatch, getState) => {
    dispatch(getTree())
    dispatch(watchHistoryChanges())
    
    let configFile = getState().Nav.get('configFile')
    dispatch(fetchFile(configFile))
    
    let configTimer = setInterval( ()=> {
      let keyPath = treeUtils.find(getState().Files, node => node.get('path') === configFile )
      if (keyPath && getState().Files.getIn(keyPath.concat('loaded')) ) {
        try {
            let data = getState().Files.getIn(keyPath.concat('data'))
            console.log(data)
            let c = JSON.parse(data);
            dispatch({type: "setConfig", config: fromJS(c) })
            console.log('Loaded!!', getState().Nav.getIn(['config', 'videoId']) )
            clearInterval(configTimer)
        } catch(e) {
            throw new Error(e); // error in the above string (in this case, yes)!
        }
      }
    }, 100 )
  }
}


export function navigateTo(path) {
  return (dispatch, getState) => {
    let {Nav} = getState();

    let currentPath = normalizedPath(History.location.pathname)
    let newPath = normalizedPath(path)
    if (currentPath != newPath){
      History.push("/"+newPath)
    }
    let key = Nav.get('index').findKey(e=>e.get('slug') == newPath)
    console.log(key)
    if(typeof key !== 'undefined') {
      let keyPath = Seq.of('index', key )
      dispatch({type: "setCurrentPath", path: newPath, keyPath: keyPath})
      let files = []
      Nav.getIn(keyPath.concat('resources')).map( res=>{
        if (!res.has('ref')) { return }
        
        if (res.get('type') === 'file') {
          dispatch(fetchFile(res.get('ref')))
        } else if (res.get('type') === 'urlref') {
          dispatch(fetchFile(Nav.getIn(['config', res.get('ref')]))) 
        }
      })
    }
  }
}

export function watchHistoryChanges() {
  console.log( "here" )
  return (dispatch, getState) => {

    // First let's load the current path
    let pathname = normalizedPath(History.location.pathname)
    console.log( "pathname", pathname )
    if (pathname.length){
      let watchTimer = setInterval(()=>{
        if (getState().Nav.get('config')) {
          dispatch(navigateTo(pathname))  
          clearInterval(watchTimer);
        }
      },100)
      
    }
    History.listen((location, action) => {
      let pathname = normalizedPath(location.pathname)
      return dispatch(navigateTo(pathname))
    })    
  }
}

export function setSidebarActiveStatus(status) {
  return (dispatch, getState) => {
    dispatch({type: "setSidebarActiveStatus", status: status})
  }
}

export function updateStatusBar(status, expires = true){
  return (dispatch, getState) => {
    clearTimeout(getState().Nav.getIn(['status', 'timer']))
    let timer;
    if (expires){
      timer = setTimeout(()=>{
        dispatch({type: "updateStatusBar", status: 'ok', message: ''})
      }, 5000)  
    }
    dispatch(Object.assign(status, {type: "updateStatusBar", timer: timer}))
  }
}


export function normalizedPath(path){
  if (/^\//.test(path)) {
    return path.slice(1)
  }
  return path
}
