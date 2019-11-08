import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import Login from '../pages/Login/index';
import PersonalCenter from '../pages/PersonalCenter';
import Transfer from '../pages/Transfer';
import TransferResult from '../pages/TransferResult';

// todo: what if write other routes inner the home route? why it cause problem?
export default (
  <Switch>
    <Redirect from='/' to='/login' exact />
    <Route path='/login' component={Login} />
    <Route path='/personal-center/:data' component={PersonalCenter} />
    <Route path='/transfer' component={Transfer} />
    <Route path='/transfer-result/:txId' component={TransferResult} />
    {/* <Route path='*' component={NoMatch} /> */}
  </Switch>
);
