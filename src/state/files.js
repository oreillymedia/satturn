/*********************************************************************
||  Import required modules
*********************************************************************/
import {fromJS, Map, findKey, keyOf} from 'immutable'
import History from '../history'
import {updateStatusBar} from './nav'

/*********************************************************************
||  Define the state tree
*********************************************************************/
export const INITIAL_STATE = fromJS({
  tree: {},
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
export const API_HOST = process.env.API_HOST || window.location.origin + (window.location.pathname + '/api/').replace(/\/{2,}/g, '/')
// const API_HOST = "http://0.0.0.0:32775/api/"

/*********************************************************************
||  The reducer
*********************************************************************/
export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case "setTree" :
      return state.set('tree', action.tree)
    case "setCurrentFile":
      return state.update('current', (current) => current.merge({'data': action.data, path: action.path, valid: action.valid}) )
    case "updateCurrentFileData":
      return state.setIn(['current', 'data'], action.data)
    case "updateCurrentFileStatus":
      return state.update('current', (current)=> current.merge(action) )
    case "validateCurrentFile":
      return state.updateIn(['current', 'valid'], action.valid)  
    case "updateStatusInFile":
      state = state.update('tree', (tree)=> updateFileInTree(tree, action.path, {status: action.status}))
    case "setExtraFile":
      return state.update('extra', (current) => current.merge({'data': action.data, path: action.path, valid: action.valid}) )
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

export function validateCurrentFile(valid) {
  return (dispatch, getState) => {
    return dispatch({action: "validateCurrentFile" ,valid: valid})
  }
}

export function setCurrentFile(path, data) {
  return (dispatch, getState) => {
    return dispatch({type: "setCurrentFile", path: path, data: data, valid: true})
  }
}
export function setExtraFile(path, data) {
  return (dispatch, getState) => {
    return dispatch({type: "setExtraFile", path: path, data: data, valid: true})
  }
}


export function updateCurrentFileData(data) {
  return (dispatch, getState) => {
    let currentPath = getState().Files.getIn(['current','path'])
    return dispatch({type: "updateCurrentFileData", data: data})
  }
}

export function updateCurrentFileStatus( status, expires = true) {
  return (dispatch, getState) => {
    clearTimeout(getState().Files.getIn(['current', 'timer']))
    let timer;
    if (expires){
      timer = setTimeout(()=>{
        dispatch(resetCurrentFileStatus())
      }, 5000)  
    }
    dispatch(updateStatusBar(status, expires))
    return dispatch(Object.assign({}, status, {type: "updateCurrentFileStatus", timer: timer}))
  }
}

export function resetCurrentFileStatus() {
  return (dispatch, getState) => {    
    dispatch({type: "updateCurrentFileStatus", status: 'ok', message: '' })
  }
}

export function saveCurrentFileToServer(data) {
  return (dispatch, getState) => {
    let currentPath = getState().Files.getIn(['current','path'])
    return dispatch(saveFileToServer(currentPath))
  }
}

export function updateStatusInFile(path, status) {
  return (dispatch, getState) => {
    return dispatch({type: "updateStatusInFile", path: path, status: status})
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


export function fetchFileFromServer(pathname) {
  return (dispatch, getState) => {
    dispatch(updateCurrentFileStatus({path: pathname, status:'loading', message:'Loading...', valid: false}))
    fetch(API_HOST + pathname, {
      method: 'GET'
    })
    .then( response => {
      if (!response.ok) {throw response}
      return response.json()
    })
    .then( data => {
      dispatch(setCurrentFile(pathname, data.content))
      dispatch(updateCurrentFileStatus({path: pathname, status:'loaded', message:'', valid: true}))
    })
    .catch( (err) => {
      console.log(err)
      if (err.status == 404) {
        return dispatch(updateCurrentFileStatus({path: pathname, status:'error', message:'Error Loading File. ' + err.statusText}))
      }
      dispatch(updateCurrentFileStatus({path: pathname, status:'error', message:'Disconnected from server'}))
      err.text().then( msg => {
        console.error(msg)
      })
    })
  }
}

export function fetchExtraFileFromServer(pathname) {
  return (dispatch, getState) => {
    fetch(API_HOST + pathname, {
      method: 'GET'
    })
    .then( response => {
      if (!response.ok) {throw response}
      return response.json()
    })
    .then( data => {
      dispatch(setExtraFile(pathname, data.content))
    })
    .catch( (err) => {
      console.log(err)
    })
  }
}


export function saveFileToServer(pathname) {
  return(dispatch, getState) => {
    dispatch(updateCurrentFileStatus({path: pathname, status: 'saving', message: 'Saving File...'}))
    const content = getState().Files.getIn(['current', 'data'])    
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
      dispatch(updateCurrentFileStatus({status: 'saved',  message: 'Saved'}))
    })
    .catch( err => {
      console.log(err)
      if (err.status == 404) {
        dispatch(updateCurrentFileStatus({status: 'error', message: 'Error saving file'}))
        return dispatch(validateCurrentFile(false))
      }
      err.text().then( msg => {
        console.error(msg)
      })
    })
  }
}


function updateFileInTree(node, pathname, data) {
  if (node.get('path') == pathname){
    // console.log('-->\n', node.toJS())
    return node.merge(data)
  } else {
    if (node.has('children')) {
      return node.update('children', (children)=> children.map( child=> updateFileInTree(child, pathname, data) ) )  
    }
    return node
  }
}
