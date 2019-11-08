/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-04 17:12:43
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-08 14:53:27
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
const initialState = {
  bridge: null
};

const common = (state = initialState, { type, payload }) => {
  switch (type) {
    case actionTypes.SET_BRIDGE:
      return { ...state, bridge: payload.bridge };
    default:
      return state;
  }
};

export default common;
