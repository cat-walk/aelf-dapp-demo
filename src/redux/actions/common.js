/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-04 17:19:32
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-07 17:07:03
 * @Description: file content
 */
import * as actionTypes from '../actionTypes/common';

export const setBridge = bridge => ({
  type: actionTypes.SET_BRIDGE,
  payload: { bridge }
});
