import React from 'react'
import ReactDOM from 'react-dom'
import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk'
import throttle from 'redux-throttle';
import {Provider, connect} from 'react-redux'

import reducer from './state'
import AppLayout from './layout'

const throttleMiddleware = throttle(3000, {trailing: true});

const createStoreWithMiddleware = applyMiddleware(thunk, throttleMiddleware)(createStore);
const store = createStoreWithMiddleware(reducer);

ReactDOM.render(
  <Provider store={store}>
    <AppLayout/>
  </Provider>,
  document.getElementById('container')
);