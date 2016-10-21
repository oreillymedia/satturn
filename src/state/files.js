/*********************************************************************
||  Import required modules
*********************************************************************/
import {fromJS, Map, findKey} from 'immutable'
import {hashHistory} from 'react-router'

/*********************************************************************
||  Define the state tree
*********************************************************************/
export const INITIAL_STATE = fromJS({
  tree: {},
  current: {
    path: '',
    data: ''
  }
})
const API_HOST = process.env.API_HOST || '/test-data/'

/*********************************************************************
||  The reducer
*********************************************************************/
export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case "saveFile":
      return state.setIn(action.path, action.data)
    case "setTree" :
      return state.set('tree', action.tree)
    case "setCurrentFile" :
      return state.set('current', fromJS({'data': action.data, path: action.path}) )
  }
  return state;
}

/*********************************************************************
||  Actions
*********************************************************************/
export function saveFile(path, data) {
  return (dispatch, getState) => {
    dispatch({type: "saveFile", path: path, data: data})
  }
}
export function setTree(tree) {
  return (dispatch, getState) => {
    dispatch({type: "setTree", tree: tree})
  }
}
export function setCurrentFile(path, data) {
  return (dispatch, getState) => {
    return dispatch({type: "setCurrentFile", path: path, data: data})
  }
}

/*********************************************************************
||  Async Actions
*********************************************************************/
export function getTree() {
  return (dispatch, getState) => {
    fetch( API_HOST + 'index', {
      method: 'GET',
    })
    .then( response => {
      if (!response.ok) {throw response}

      return response.json()
    })
    .then( json => {
      dispatch(setTree(fromJS(json)))
    })
    .catch( err => {
      console.log(err)
      err.text().then( msg => {
        console.error(msg)
      })
    })
  }
}


export function getFile(path) {  
  return (dispatch, getState) => {
    fetch(API_HOST + 'files/' + path, {
      method: 'GET'
    })
    .then( response => {
      if (!response.ok) {throw response}
      return response.text()
    })
    .then( text => {
      dispatch(setCurrentFile(path, text))
    })
    .catch( err => {
      console.log(err)
      err.text().then( msg => {
        console.error(msg)
      })
    })
  }
}
