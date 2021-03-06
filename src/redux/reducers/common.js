/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-04 17:12:43
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-11 19:55:17
 * @Description: file content
 */
// import AElfBridge from 'aelf-bridge';
import * as actionTypes from '../actionTypes/common';

// todo: Consider to place the bridge in global, such as window.bridge
// const bridge = new AElfBridge({
//   proxyType: 'SOCKET.IO',
//   socketUrl: 'http://localhost:35443'
//   // channelType: 'ENCRYPT'
// });

// todo: Consider to get the connected bridge as initialState
// todo: How to simplefy the code of redux
const initialState = {
  bridge: null,
  balance: null
};

const common = (state = initialState, { type, payload }) => {
  switch (type) {
    case actionTypes.SET_BRIDGE:
      return { ...state, bridge: payload.bridge };
    case actionTypes.SET_BALANCE:
      console.log({
        payload
      });
      return { ...state, balance: payload.balance };
    default:
      return state;
  }
};

export default common;
