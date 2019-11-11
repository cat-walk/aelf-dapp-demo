/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-04 17:19:32
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-11 19:59:47
 * @Description: file content
 */
import * as actionTypes from '../actionTypes/common';

export const setBridge = bridge => ({
  type: actionTypes.SET_BRIDGE,
  payload: { bridge }
});

export const setBalance = balance => ({
  type: actionTypes.SET_BALANCE,
  payload: { balance }
});
