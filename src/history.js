import createHistory from 'history/createBrowserHistory' 
import {dispatch} from 'redux'
import {getFile} from './state/files'


const history = createHistory()

export default const location = history.location

export const unlisten = history.listen((location, action) => {
  console.log(action, location.pathname, location.state)
  dispatch(getFile(location.pathname))
})