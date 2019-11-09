/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-07 15:54:58
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-09 15:09:42
 * @Description: file content
 */
export const centerEllipsis = input =>
  input.replace(input.slice(10, 36), '...');

export const formatToken = value => {
  return value.toLocaleString('zh', {
    minimumFractionDigits: 8
  });
};
