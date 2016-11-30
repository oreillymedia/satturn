/*********************************************************************
||  Import required modules
*********************************************************************/
import {fromJS, Map} from 'immutable'
import createHistory from 'history/createHashHistory' 
import {fetchFileFromServer, fetchExtraFileFromServer} from './files'
import {store} from '../'

export const History = createHistory()

/*********************************************************************
||  Define the state tree
*********************************************************************/
export const INITIAL_STATE = fromJS({
  currentPath: "",
  sidebarActiveStatus: true,
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
    case "setCurrentPath":
      return state.set("currentPath", action.currentPath)
    case "setSidebarActiveStatus":
      return state.set("sidebarActiveStatus", action.status)
    case "updateStatusBar":
      return state.update('status', (status)=> status.merge({status: action.status, message: action.message, timer: action.timer}))
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
      dispatch(fetchFileFromServer(newPathname))
      if (newPathname == 'cues.json') {
        dispatch(fetchExtraFileFromServer('main.html'))  
      }
    }
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
        dispatch(resetStatusBar())
      }, 5000)  
    }
    dispatch(Object.assign(status, {type: "updateStatusBar", timer: timer}))
  }
}
export function resetStatusBar(){
  return (dispatch, getState) => {
   dispatch({type: "updateStatusBar", status: 'ok', message: ''})
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

export function normalizedPathname(pathname){
  if (/^\//.test(pathname)) {
    return pathname.slice(1)
  }
  return pathname
}
