import createHistory from 'history/createHashHistory' 
export default History = createHistory()

export function setPath(path){
  // console.log(History.location.pathname)
  if (History.location.pathname != path) {
    History.push(path)  
  }
}
export function getPathFromLocation(location){
  return location.pathname
}
export function getHistoryPath(){
  return getPathFromLocation(History.location)
}