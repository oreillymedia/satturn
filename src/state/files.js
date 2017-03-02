/*********************************************************************
||  Import required modules
*********************************************************************/
import  {Iterable, fromJS, Map, findKey, keyOf, Seq} from 'immutable'
import throttle from 'lodash.throttle'
import TreeUtils from 'immutable-treeutils';

import History from '../history'
import {updateStatusBar, updateConfig} from './nav'

export const treeUtils = new TreeUtils(Seq.of('tree'), 'id', 'children');
export const treeWalker = new TreeUtils(Seq(), 'id', 'children') // when iterating inside the tree
export const API_HOST = process.env.API_HOST || window.location.origin + (window.location.pathname + '/api/').replace(/\/{2,}/g, '/')

/*********************************************************************
||  Define the state tree
*********************************************************************/
export const INITIAL_STATE = fromJS({
  tree: {},
})

/*********************************************************************
||  The reducer
*********************************************************************/
export default function(state = INITIAL_STATE, action) {
  
  switch (action.type) {
    case "setTree" :

      let newState = state.update('tree', tree=>{
        let newTree = action.tree
        // we only want to keep files that still exist,
        // so we will only iterate through the new tree...
        for ( let nodePath of treeWalker.nodes(action.tree) ) {
          // for every node in the tree
          let path = action.tree.getIn(nodePath.concat('path'))
          let keyPath = treeWalker.find(tree, node => node.get('path') === path )
          // if there is a matching path in the old tree
          if (keyPath) {
            // update the existing with the new contents and data
            let existing = tree.getIn(keyPath)
            newTree = newTree.updateIn(nodePath, (file)=> existing.merge(file) )
          }
        }
        return newTree
      })      
      return newState

    case "updateFile":
      if (action.keyPath) {
        state = state.updateIn(action.keyPath, (node)=> node.merge(action.data) )  
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
    let keyPath = treeUtils.find(getState().Files, node => node.get('path') === path )
    let timer = (keyPath) ? getState().Files.getIn(keyPath.concat('timer')) : null;
    clearTimeout(timer)
    
    if (statusExpires){
      timer = setTimeout(()=>{
        dispatch({type: "updateFile", path: path, keyPath: keyPath, data: {status: "ok", message: "", timer : timer } })
      }, 5000)  
    }
    data.timer = timer;
    if (path == getState().Nav.get('configFile') && data.content ) {
      dispatch(updateConfig(data.content))
    }
    if (data.content) {
      // here we should be able to trigger a throttled saveFileToServer
    }
    if (data.objectProp){
      return dispatch(updatePropInJsonFile(path, keyPath, data))
    } else {
      return dispatch({type: "updateFile", path: path, keyPath: keyPath, data: data})    
    }
    
  }
}

export function updatePropInJsonFile(path, keyPath, data) {
  return (dispatch, getState) => {
    try {
      let fileContent = JSON.parse( getState().Files.getIn(keyPath.concat('content')) )
      fileContent[data.objectProp] = (typeof data.content == 'string') ? JSON.parse(data.content) : data.content;
      data.content = JSON.stringify(fileContent, null, 2)
      delete data.objectProp
      return dispatch({type: "updateFile", path: path, keyPath: keyPath, data: data })
    } catch(e) {
      throw new Error(e);
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
      return dispatch(setTree(fromJS(json)))
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

export function getFile(path, defaultContent) {
  return (dispatch, getState) => {
    if (!defaultContent) {
      defaultContent = /.json/.test(path) ? "{}" : " "
    }
    if (Iterable.isIterable(defaultContent)){
      defaultContent = JSON.stringify(defaultContent.toJSON());
    }
    if (typeof defaultContent == "object"){
      console.log(defaultContent)
      defaultContent = JSON.stringify(defaultContent);
    }
    let keyPath = treeUtils.find(getState().Files, node => node.get('path') === path )
    if (!keyPath){
      return dispatch(createFileInServer(path, defaultContent))
    } else {
      return dispatch(fetchFileFromServer(path))
    }
  }
}
export function fetchFileFromServer(path) {
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
      return dispatch(updateFile(path, {content: data.content, status:'loaded', message:'', loaded: true}))
    })
    .catch( (err) => {
      console.log(err)
      if (err.status == 404) {
        return dispatch(updateFile(path, {status:'error', message: 'File not found. ' + err.statusText, loaded: false}))
      }
      dispatch(updateStatusBar({status:'error', message:'Server Error'}, true))
      err.text().then( msg => {
        console.error(msg)
      })
    })
  }
}

export function createFileInServer(path, content) {
  return(dispatch, getState) => {
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
      return dispatch(getTree()).then( response =>{
        return dispatch(updateFile(path, {status: 'created',  message: path + ' created', content: content, loaded: true}, true))
      })
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

export function saveFileToServer(path) {
  return(dispatch, getState) => {
    let keyPath = treeUtils.find(getState().Files, node => node.get('path') === path )
    if (!keyPath) return false

    dispatch(updateFile(path, { status: 'saving', message: 'Saving File...'}))
    
    const content = getState().Files.getIn(keyPath.concat('content'))
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

export let throttledSaveFileToServer = throttle( saveFileToServer, 1000, {leading: false, trailing: true} )
