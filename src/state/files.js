/*********************************************************************
||  Import required modules
*********************************************************************/
import {fromJS, Map, findKey} from 'immutable'
import throttle from 'lodash.throttle'
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
export const API_HOST = process.env.API_HOST || window.location.origin + (window.location.pathname + '/test-data/').replace(/\/{2,}/g, '/')
export const ROOT = process.env.ROOT || window.location.origin + (window.location.pathname + '/test-data/files/').replace(/\/{2,}/g, '/')


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
    let currentPath = getState().Files.getIn('current','path')
    // this should be throttled but i couldn't figure out how to make it work :/
    dispatch(saveFileToServer(currentPath, data))
    return dispatch({type: "saveCurrentInState", data: data})
  }
}

/*********************************************************************
||  Async Actions
*********************************************************************/
export function getTree() {
  return (dispatch, getState) => {
    dispatch(setLoadingStatus(true, '/', 'Fetching File Index...'))
    fetch( API_HOST + 'index', {
      method: 'GET',
    })
    .then( response => {
      if (!response.ok) {throw response}

      return response.json()
    })
    .then( json => {
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
    console.log('Fetching File on path "%s"', pathname)
    dispatch(setLoadingStatus(true, pathname, 'Fetching File...'))
    fetch(API_HOST + 'files/' + pathname, {
      method: 'GET'
    })
    .then( response => {
      if (!response.ok) {throw response}
      return response.text()
    })
    .then( text => {
      dispatch(setLoadingStatus(false, pathname, ''))
      dispatch(setCurrentFile(pathname, text))
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

export function createThrottledAction(actionCreator, delay) {
  return throttle((dispatch, getState) => (...actionArgs) => dispatch(actionCreator(...actionArgs)), delay);
}
// this would be a call to an actual API
let timer = 0;

export function saveFileToServer(pathname) {
  return(dispatch, getState) => {
    const path = getState().Files.getIn(['current', 'path'])
    clearTimeout(timer)
    console.log('Fake Saving File...', path)
    dispatch(setSavingStatus(true, path , 'Fake Saving File...'))
    timer = setTimeout(()=>{
      dispatch(setSavingStatus(false, path, ''))
    }, 500)
  }
}
export const throttledSaveFileToServer = createThrottledAction(saveFileToServer, 3000)