/*********************************************************************
||  Import required modules
*********************************************************************/
import {fromJS, Map, findKey} from 'immutable'
import History from '../history'
import {updatePathName} from './nav'
import {setLoadingStatus, setSavingStatus} from './nav'

/*********************************************************************
||  Define the state tree
*********************************************************************/
export const INITIAL_STATE = fromJS({
  tree: {},
  current: {
    path: '',
    data: '',
    valid: false
  },
  'processing' : {
    
  }
})
export const API_HOST = process.env.API_HOST || window.location.origin + (window.location.pathname + '/api/').replace(/\/{2,}/g, '/')

/*********************************************************************
||  The reducer
*********************************************************************/
export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case "setTree" :
      return state.set('tree', action.tree)
    case "setCurrentFile" :
      return state.set('current', fromJS({'data': action.data, path: action.path, valid: action.valid}) )
    case "saveCurrentInState":
      return state.setIn(['current', 'data'], action.data)
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
export function setCurrentFile(path, data) {
  return (dispatch, getState) => {
    return dispatch({type: "setCurrentFile", path: path, data: data, valid: true})
  }
}
export function setCurrentFileInvalid(path, err) {
  return (dispatch, getState) => {
    return dispatch({type: "setCurrentFile", path: path, data: err, valid: false})
  }
}

export function updateCurrentFile(data) {
  return (dispatch, getState) => {
    let currentPath = getState().Files.getIn(['current','path'])
    return dispatch({type: "saveCurrentInState", data: data})
  }
}

export function saveCurrentFile(data) {
  return (dispatch, getState) => {
    let currentPath = getState().Files.getIn(['current','path'])
    return dispatch(saveFileToServer(currentPath))
  }
}
/*********************************************************************
||  Async Actions
*********************************************************************/
export function getTree() {
  return (dispatch, getState) => {
    dispatch(setLoadingStatus(true, '/', 'Fetching File Index...'))
    console.log(API_HOST)
    fetch( API_HOST, {
      method: 'GET',
    })
    .then( response => {
      if (!response.ok) {throw response}

      return response.json()
    })
    .then( json => {
      console.log(json)
      dispatch(setTree(fromJS(json)))
      dispatch(setLoadingStatus(false, '', ''))
    })
    .catch( err => {
      console.log(err)
      err.text().then( msg => {
        console.error(msg)
      })
    })
  }
}


export function fetchFileFromServer(pathname) {
  return (dispatch, getState) => {
    // console.log('Fetching File on path "%s"', pathname)
    dispatch(setLoadingStatus(true, pathname, 'Fetching File...'))
    fetch(API_HOST + pathname, {
      method: 'GET'
    })
    .then( response => {
      if (!response.ok) {throw response}
      return response.json()
    })
    .then( data => {
      dispatch(setLoadingStatus(false, pathname, ''))
      dispatch(setCurrentFile(pathname, data.content))
    })
    .catch( err => {
      console.log(err)
      if (err.status == 404) {
        return dispatch(setCurrentFileInvalid(pathname, err.statusText))
      }
      err.text().then( msg => {
        console.error(msg)
      })
    })
  }
}

export function saveFileToServer(pathname) {
  return(dispatch, getState) => {
    dispatch(setSavingStatus(true, pathname , 'Saving File...'))
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
      setTimeout( ()=> {dispatch(setSavingStatus(false, pathname, ''))}, 500)
    })
    .catch( err => {
      console.log(err)
      if (err.status == 404) {
        dispatch(setSavingStatus(true, pathname, 'Error saving file'))
        return dispatch(setCurrentFileInvalid(pathname, err.statusText))
      }
      err.text().then( msg => {
        console.error(msg)
      })
    })
  }
}