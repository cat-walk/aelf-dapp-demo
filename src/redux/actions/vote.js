/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-09 20:49:34
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-09 21:06:30
 * @Description: file content
 */
import * as actionTypes from '../actionTypes/vote';

export const setUserVotes = userVotes => {
  return {
    type: actionTypes.SET_USER_VOTES,
    payload: userVotes
  };
};
