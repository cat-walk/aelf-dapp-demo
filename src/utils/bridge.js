/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-07 18:44:03
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-07 18:46:03
 * @Description: file content
 */
import store from '@redux/store';

export const getBridge = () => store.getState().common.bridge;
