/*********************************************************************
||  Import required modules
*********************************************************************/
import  {fromJS, Map, findKey, keyOf, Seq} from 'immutable'
import throttle from 'lodash.throttle'
import TreeUtils from 'immutable-treeutils';

import History from '../history'
import {updateStatusBar, updateConfig} from './nav'

export const treeUtils = new TreeUtils(Seq.of('tree'), 'id', 'children');
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
      return state.update('tree', tree=> tree.mergeDeep(action.tree)  )
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
    let {Files, Nav} = getState();
    let keyPath = treeUtils.find(Files, node => node.get('path') === path )
    let timer = (keyPath) ? Files.getIn(keyPath.concat('timer')) : null;
    clearTimeout(timer)
    
    if (statusExpires){
      timer = setTimeout(()=>{
        dispatch({type: "updateFile", path: path, keyPath: keyPath, data: {status: "ok", message: "", timer : timer } })
      }, 5000)  
    }
    data.timer = timer;
    if (path == Nav.get('configFile') && data.content ) {
      dispatch(updateConfig(data.content))
    }
    if (data.content) {
      // here we should be able to trigger a throttled saveFileToServer
    }
    if (data.objectProp){
      console.log('has objectProp', data.objectProp)
      return dispatch(updatePropInJsonFile(path, keyPath, data))
    } else {
      console.log('updating', path)
      return dispatch({type: "updateFile", path: path, keyPath: keyPath, data: data})    
    }
    
  }
}

export function updatePropInJsonFile(path, keyPath, data) {
  return (dispatch, getState) => {
    try {
      let fileContent = JSON.parse( getState().Files.getIn(keyPath.concat('content')) )
      fileContent[data.objectProp] = (typeof data.content == 'string') ? JSON.parse(data.content) : data.content;
      console.log(path, fileContent)
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

export function getFile(path, defaultContent) {
  if (!defaultContent) {
    defaultContent = /.json/.test(path) ? "{}" : " "
  }

  return (dispatch, getState) => {
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
      dispatch(updateFile(path, {content: data.content, status:'loaded', message:'', loaded: true}))
      console.log( "done fetching %s", path )
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
      console.log('file created')
      return dispatch(getTree()).then( response =>{
        console.log('got new tree')
        dispatch(updateFile(path, {status: 'created',  message: path + ' created', content: content}, true))
        console.log('created', path)
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
