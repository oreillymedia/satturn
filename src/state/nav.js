/*********************************************************************
||  Import required modules
*********************************************************************/
import {fromJS, Map} from 'immutable'
import {hashHistory} from 'react-router'


/*********************************************************************
||  Define the state tree
*********************************************************************/
export const INITIAL_STATE = fromJS({
  CurrentRoute: ""
})

/*********************************************************************
||  The reducer
*********************************************************************/
export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case "setNavCurrentRoute":
      return state.set("CurrentRoute", action.currentRoute)
  }
  return state;
}

/*********************************************************************
||  Actions
*********************************************************************/
export function setRoute(routeName) {
  return (dispatch, getState) => {
    hashHistory.push(routeName)
    dispatch({type: "setNavCurrentRoute", currentRoute: routeName})
  }
}