/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-08 21:01:32
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-08 21:47:15
 * @Description: file content
 */
import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';

import Login from '@components/Login';
// import PersonalCenter from '../pages/PersonalCenter';
// import Transfer from '../pages/Transfer';
// import TransferResult from '../pages/TransferResult';

// todo: what if write other routes inner the home route? why it cause problem?
export default (
  <Switch>
    <Route path='/login'>
      <Login appName='Resource'></Login>
    </Route>
    <Redirect from='/' to='/login' exact />

    {/* <Route path='/personal-center/:data' component={PersonalCenter} />
    <Route path='/transfer' component={Transfer} />
    <Route path='/transfer-result/:txId' component={TransferResult} />
    <Route path='*' component={NoMatch} /> */}
  </Switch>
);
