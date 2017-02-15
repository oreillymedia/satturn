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
  name: "Oriole Editor",
  index:[
    {path: "markdown", name: "Markdown Editor",  editor: "markdown", 
      resources: [
        {type:'urlInProp', ref:'source'},
        {type:'urlInProp', ref:'htmlContent'}
      ]},
    {path: "annotator", name: "Cue Annotator",  editor: "ormAnnotator", 
      resources: [
        {type:'prop', ref:'cues'},
        {type:'urlInProp', ref:'htmlContent'}
      ]},
    {path: "oriole-settings", name: "Oriole Settings", editor: "json", 
      resources: [
        {type: 'url', path: "oriole.json"}
      ]},
    {path: "atlas-settings", name: "Atlas Settings", editor: "json", 
      resources: [
        {type: 'url', path:'atlas.json'}
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
    case "updateConfig":
      return state.update('config', (c)=> {
        return (c) ? c.merge(action.config) : action.config
      } )
    case "setCurrentPath":
      return state.update('current', (c)=> c.merge({path: action.path, keyPath: action.keyPath}) )
      return state
    case "selectEditor":
      return state.setIn(action.keyPath.concat('selected'), true )
    case "setSidebarActiveStatus":
      return state.set("sidebarActiveStatus", action.status)
    case "updateStatusBar":
      return state.update('status', (status)=> status.merge({status: action.status, message: action.message, timer: action.timer}))
    case "updateIndex":
      state = state.update('index', index=> index.merge(action.index)) 
      return state
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
        dispatch(updateConfig())
        dispatch(updateIndex())
        dispatch(watchHistoryChanges())
      })
    })
  }
}

export function updateConfig(){
  return (dispatch, getState) => {
    let configFile = getState().Nav.get('configFile') 
    let keyPath = treeUtils.find(getState().Files, node => node.get('path') === configFile )
    if (!keyPath){
      dispatch(updateStatusBar({message: "File '"+configFile+"' not found!"}, false))
      throw new Error('Config File Missing. No file matching ' + configFile) 
    }
    let data = getState().Files.getIn(keyPath.concat('data'))
    if (data) {
      let config = fromJS(JSON.parse(data));
      dispatch({type: "updateConfig", config: config})  
    }
    
  }
}

export function updateIndex(){
  return (dispatch, getState) => {
    let index = getState().Nav.get('index')
    let config = getState().Nav.get('config')
    index = index.map( (feat)=> {
      return feat.update('resources', (r)=>{ 
        return r.map((res)=>{
          if (res.get('type') === 'urlInProp') {
            return res.set('path', config.get( res.get('ref')))
          } else if (res.get('type') === 'prop') {
              return res.set('path', getState().Nav.get('configFile'))
          }
          return res
          
        })
      })
    })
    return dispatch({type: "updateIndex", index: index })
  }
}

export function navigateTo(path) {
  return (dispatch, getState) => {
    let {Nav} = getState();

    let currentPath = normalizedPath(History.location.pathname)
    let newPath = normalizedPath(path)
    if (currentPath != newPath){
      document.title = Nav.get('name') + " - " + newPath
      History.push("/"+newPath)
    }

    let key = Nav.get('index').findKey(e=>e.get('path') == newPath)

    if(typeof key !== 'undefined') {

      let keyPath = Seq.of('index', key )
      
      Nav.getIn(keyPath.concat('resources')).forEach( res=>{
        if ( ['url', 'urlInProp'].includes( res.get('type') ) ) {
          dispatch(fetchFile(res.get('path')))
        }
      })
      dispatch({type: "setCurrentPath", path: newPath, keyPath: keyPath})

    } else {
      dispatch({type: "setCurrentPath", path: null})      
    }
  }
}

export function watchHistoryChanges() {
  return (dispatch, getState) => {
    // First let's load the current path
    let pathname = normalizedPath(History.location.pathname)
    document.title = Nav.get('name')
    if (pathname.length){
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
