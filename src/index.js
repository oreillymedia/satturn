import React from 'react'
import ReactDOM from 'react-dom'
import {createStore, applyMiddleware} from 'redux';
import { Router, Route, hashHistory} from 'react-router'
import thunk from 'redux-thunk'
import {Provider, connect} from 'react-redux'

import reducer from './state'

import AppLayout from './layout'
import Welcome from './components/welcome'
import NotFound from './components/not-found'

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
const store = createStoreWithMiddleware(reducer);


const routes = (
  <Route component={AppLayout}>
    <Route name="welcome" path="/" component={Welcome}  />
    <Route path="*" component={NotFound} />
  </Route>
)

ReactDOM.render(
  <Provider store={store}>
    <Router history={hashHistory}>{routes}</Router>
  </Provider>,
  document.getElementById('container')
);