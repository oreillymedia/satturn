/*********************************************************************
||  Import required modules
*********************************************************************/
import  {fromJS, Map, findKey, keyOf, Seq} from 'immutable'

import History from '../history'
import {updateStatusBar, updateConfig} from './nav'

import TreeUtils from 'immutable-treeutils';
export const treeUtils = new TreeUtils(Seq.of('tree'), 'id', 'children');

export const API_HOST = process.env.API_HOST || window.location.origin + (window.location.pathname + '/api/').replace(/\/{2,}/g, '/')

/*********************************************************************
||  Define the state tree
*********************************************************************/
export const INITIAL_STATE = fromJS({
  tree: {},
  queue: {},
  selected: [], 
  current: {
    path: '',
    data: '',
    status: '',
    message: '',
    valid: false,
    timer: -1
  },
  extra: {
    path: '',
    data: '',
    valid: false
  }
})



/*********************************************************************
||  The reducer
*********************************************************************/
export default function(state = INITIAL_STATE, action) {
  
  switch (action.type) {
    case "setTree" :
      return state.set('tree', action.tree)
    
    case "updateFile":
      if (action.keyPath) {
        state = state.updateIn(action.keyPath, (node)=> node.merge(action.data) )  
        // console.log( "done updating %s", state.getIn(action.keyPath).get('path'), state.getIn(action.keyPath).toJS() )
        return state
      }
  }
  return state;
}

/*********************************************************************
||  Actions
*********************************************************************/


export function setTree(tree) {
  return (dispatch, getState) => {
    return dispatch({type: "setTree", tree: tree})
  }
}

export function updateFile(path, data, statusExpires = false) {
 return (dispatch, getState) => {
    let {Files, Nav} = getState();
    let keyPath = treeUtils.find(Files, node => node.get('path') === path )
    let timer = (keyPath) ? Files.getIn(keyPath.concat('timer')) : null;
    clearTimeout(timer)
    if (statusExpires){
      timer = setTimeout(()=>{
        dispatch({type: "updateFile", path: path, keyPath: keyPath, data: {status: "ok", message: "", timer : timer } })
      }, 5000)  
    }
    if (path == Nav.get('configFile')) {
      dispatch(updateConfig())
    }

    data.timer = timer;
    return dispatch({type: "updateFile", path: path, keyPath: keyPath, data: data})
 } 
}

export function updateInJsonFile(path, data, objectProp) {
  return (dispatch, getState) => {
    let keyPath = treeUtils.find(getState().Files, node => node.get('path') === path )  
    if (!keyPath) return false
    try {
      let fileData = JSON.parse( getState().Files.getIn(keyPath.concat('data')) )
      fileData[objectProp] = (typeof data == 'string') ? JSON.parse(data) : data;
      return dispatch({type: "updateFile", path: path, keyPath: keyPath, data: {data: JSON.stringify(fileData, null, 2)} })
    } catch(e) {
      console.log(e)
      throw new Error(e); // error in the above string (in this case, yes)!
    }
  }
  
}


/*********************************************************************
||  Async Actions
*********************************************************************/
export function getTree() {
  return (dispatch, getState) => {
    return fetch( API_HOST, {
      method: 'GET',
    })
    .then( response => {
      if (!response.ok) {throw response}
      return response.json()
    })
    .then( json => {
      let tree = fromJS(json);
      // directories first
      tree = tree.update('children', (c)=> c.sort((a,b)=> a.get('type').localeCompare(b.get('type'))))
      dispatch(setTree(tree))
    })
    .catch( err => {
      dispatch(updateStatusBar({status: 'error', message: 'Error loading File Index'}, false))
      console.log(err)
      err.text().then( msg => {
        console.error(msg)
      })
    })
  }
}


export function fetchFile(path) {
  return (dispatch, getState) => {
    dispatch(updateFile(path, { status:'loading', message:'Loading...' }, false))
    return fetch(API_HOST + path, {
      method: 'GET'
    })
    .then( response => {
      if (!response.ok) {throw response}
      return response.json()
    })
    .then( data => {
      dispatch(updateFile(path, {data: data.content, status:'loaded', message:'', loaded: true}))
      // console.log( "done fetching %s", path )
    })
    .catch( (err) => {
      console.log(err)
      if (err.status == 404) {
        return dispatch(updateFile(path, {status:'error', message:'File not found. ' + err.statusText, loaded: false}))
      }
      dispatch(updateStatusBar({status:'error', message:'Server Error'}, true))
      err.text().then( msg => {
        console.error(msg)
      })
    })
  }
}

export function saveFileToServer(path) {
  return(dispatch, getState) => {
    let keyPath = treeUtils.find(getState().Files, node => node.get('path') === path )
    if (!keyPath) return false

    dispatch(updateFile(path, { status: 'saving', message: 'Saving File...'}))
    
    const content = getState().Files.getIn(keyPath.concat('data'))
    const data = new FormData();
    data.append( "content", content );
    return fetch(API_HOST + path, {
      method: 'POST',
      body: data
    })
    .then( response => {
      if (!response.ok) {throw response}
      return response.json()
    })
    .then( data => {
      // console.log('saved ', path)
      dispatch(updateFile(path, {status: 'saved',  message: 'Saved'}, true))
    })
    .catch( err => {
      console.log(err)
      if (err.status == 404) {
        dispatch(updateFile(path, {status: 'error', message: 'Error saving file'}))
      } else {
        dispatch(updateFile(path, {status: 'error', message: `Server Error:${err}`}))
      }
      err.text().then( msg => {
        console.error(msg)
      })
    })
  }
}
