/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-04 17:10:57
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-09 21:09:20
 * @Description: file content
 */
import { combineReducers } from 'redux';
import common from './common';
import vote from './vote';

export default combineReducers({
  common,
  vote
});
