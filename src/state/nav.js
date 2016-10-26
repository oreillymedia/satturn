/*********************************************************************
||  Import required modules
*********************************************************************/
import {fromJS, Map} from 'immutable'
import createHistory from 'history/createHashHistory' 
import {fetchFile} from './files'
import {store} from '../'

export const History = createHistory()

/*********************************************************************
||  Define the state tree
*********************************************************************/
export const INITIAL_STATE = fromJS({
  currentPath: "",
  sidebarActiveStatus: true
})

/*********************************************************************
||  The reducer
*********************************************************************/
export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case "setCurrentPath":
      return state.set("currentPath", action.currentPath)
    case "setSidebarActiveStatus":
      return state.set("sidebarActiveStatus", action.status)
    case "setLoadingStatus":
      return state.setIn(['processing', action.path], fromJS({'loading': action.status, 'message' : action.message}))
    case "setSavingStatus":
      return state.setIn(['processing', action.path], fromJS({'saving': action.status, 'message' : action.message}))
  }
  return state;
}

/*********************************************************************
||  Actions
*********************************************************************/
export function navigateTo(pathname) {
  return (dispatch, getState) => {
    let currentPathname = normalizedPathname(History.location.pathname)
    let newPathname = normalizedPathname(pathname)
    if (currentPathname != newPathname){
      History.push("/"+newPathname)
    }
    dispatch({type: "setCurrentPath", currentPath: newPathname})
    // if there are non-file routes, we would filter here.

    // avoid duplicated fetch
    if (getState().Files.getIn(['processing', 'path']) !== newPathname) {
      dispatch(fetchFile(newPathname))  
    }
  }
}
export function setSidebarActiveStatus(status) {
  return (dispatch, getState) => {
    dispatch({type: "setSidebarActiveStatus", status: status})
  }
}

export function watchHistoryChanges(status) {
  return (dispatch, getState) => {
    let pathname = normalizedPathname(History.location.pathname)
    if (pathname.length){
      dispatch(navigateTo(pathname))  
    }
    History.listen((location, action) => {
      let pathname = normalizedPathname(location.pathname)
      return dispatch(navigateTo(pathname))
    })    
  }
}

export function setLoadingStatus(status, path, message) {
  return (dispatch, getState) => {
    return dispatch({type: "setLoadingStatus", status: status, path: normalizedPathname(path), message: message})
  }
}
export function setSavingStatus(status, path, message) {
  return (dispatch, getState) => {
    return dispatch({type: "setSavingStatus", status: status, path: normalizedPathname(path), message: message})
  }
}


function normalizedPathname(pathname){
  if (/^\//.test(pathname)) {
    return pathname.slice(1)
  }
  return pathname
}
