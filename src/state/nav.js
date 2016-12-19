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
  current: {},
  configFile: "oriole.json",
  index:[
    {slug: "markdown", name: "Markdown Editor",  editor: "markdown", 
      resources: [
        {type:'urlref', ref:'source'}
      ]},
    {slug: "annotator", name: "Cue Annotator",  editor: "ormAnnotator", 
      resources: [
        {type:'urlref', ref:'htmlContent'},
        {type:'ref', ref:'cues'}
      ]},
    {slug: "oriole-settings", name: "Oriole Settings", editor: "json", 
      resources: [
        {type: 'file', ref: "oriole.json"}
      ]},
    {slug: "atlas-settings", name: "Atlas Settings", editor: "json", 
      resources: [
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
      return state.setIn(['current'], {path: action.path, keyPath: action.keyPath})
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
    dispatch(getTree()).then( ()=> {
      let configFile = getState().Nav.get('configFile')    
      dispatch(fetchFile(configFile)).then( ()=>{
        let keyPath = treeUtils.find(getState().Files, node => node.get('path') === configFile )
        try {
            let data = getState().Files.getIn(keyPath.concat('data'))
            let c = JSON.parse(data);
            dispatch({type: "setConfig", config: fromJS(c) })
            console.log('Loaded config for %s', getState().Nav.getIn(['config', 'title']) )
        } catch(e) {
            throw new Error(e); // error in the above string (in this case, yes)!
        }
        dispatch(watchHistoryChanges())
      })
    })
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
    console.log(newPath)

    let key = Nav.get('index').findKey(e=>e.get('slug') == newPath)

    if(typeof key !== 'undefined') {

      let keyPath = Seq.of('index', key )
      
      Nav.getIn(keyPath.concat('resources')).map( res=>{
        if (!res.has('ref')) { return }
        if (res.get('type') === 'file') {
          console.log('getting file %s', res.has('ref') )
          dispatch(fetchFile(res.get('ref')))
        } else if (res.get('type') === 'urlref') {
          console.log('getting file on %s', res.has('ref') )
          dispatch(fetchFile(Nav.getIn(['config', res.get('ref')]))) 
        }
      })
      
      dispatch({type: "setCurrentPath", path: newPath, keyPath: keyPath})

    }
  }
}

export function watchHistoryChanges() {
  return (dispatch, getState) => {
    // First let's load the current path
    let pathname = normalizedPath(History.location.pathname)

    if (pathname.length){
      console.log("getting", pathname)
      dispatch(navigateTo(pathname))  
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
