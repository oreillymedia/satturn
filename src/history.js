import createHistory from 'history/createBrowserHistory' 
import {dispatch} from 'redux'
import {getFile} from './state/files'


export default history = createHistory()

console.log(history.location)

export const unlisten = history.listen((location, action) => {
  console.log(action, location.pathname, location.state)
  dispatch(getFile(location.pathname))
})