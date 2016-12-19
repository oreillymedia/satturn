/*********************************************************************
||  Import required modules
*********************************************************************/
import  {fromJS, Map, findKey, keyOf, Seq} from 'immutable'

import History from '../history'
import {updateStatusBar} from './nav'

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
        console.log( state.getIn(action.keyPath).toJS() )
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

export function updateFile(path, data, expires = false) {
 return (dispatch, getState) => {
    let {Files} = getState();
    let keyPath = treeUtils.find(Files, node => node.get('path') === path )
    let timer = (keyPath) ? Files.getIn(keyPath.concat('timer')) : null;
    clearTimeout(timer)
    if (expires){
      timer = setTimeout(()=>{
        dispatch({type: "updateFile", path: path, keyPath: keyPath, data: {status: "ok", message: "", timer : timer } })
      }, 5000)  
    }
    data.timer = timer;
    return dispatch({type: "updateFile", path: path, keyPath: keyPath, data: data})
 } 
}




/*********************************************************************
||  Async Actions
*********************************************************************/
export function getTree() {
  return (dispatch, getState) => {
    fetch( API_HOST, {
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


export function fetchFile(pathname) {
  return (dispatch, getState) => {
    dispatch(updateFile(pathname, { status:'loading', message:'Loading...' }, false))
    fetch(API_HOST + pathname, {
      method: 'GET'
    })
    .then( response => {
      if (!response.ok) {throw response}
      return response.json()
    })
    .then( data => {
      dispatch(updateFile(pathname, {data: data.content, status:'loaded', message:'', loaded: true}))
    })
    .catch( (err) => {
      console.log(err)
      if (err.status == 404) {
        return dispatch(updateFile(pathname, {status:'error', message:'File not found. ' + err.statusText, loaded: false}))
      }
      dispatch(updateStatusBar({status:'error', message:'Server Error'}, true))
      err.text().then( msg => {
        console.error(msg)
      })
    })
  }
}

export function saveFileToServer(pathname, content) {
  return(dispatch, getState) => {
    dispatch(updateFile(pathname, { status: 'saving', message: 'Saving File...'}))
    const data = new FormData();
    data.append( "content", content );
    fetch(API_HOST + pathname, {
      method: 'POST',
      body: data
    })
    .then( response => {
      if (!response.ok) {throw response}
      return response.json()
    })
    .then( data => {
      dispatch(updateFile(pathname, {status: 'saved',  message: 'Saved'}, true))
    })
    .catch( err => {
      console.log(err)
      if (err.status == 404) {
        dispatch(updateFile(pathname, {status: 'error', message: 'Error saving file'}))
      }
      err.text().then( msg => {
        console.error(msg)
      })
    })
  }
}
