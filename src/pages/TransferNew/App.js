import React from 'react';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import 'antd-mobile/dist/antd-mobile.css';

import routes from './routes';
import store from '../../redux/store';
import Base from './Base';
import './App.css';
import './style/common.css';

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <Base>
          <HashRouter>{routes}</HashRouter>
        </Base>
      </Provider>
    </div>
  );
}

export default App;
