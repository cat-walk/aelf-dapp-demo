/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-09 21:26:45
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-09 21:27:01
 * @Description: file content
 */
import * as AElf from 'aelf-sdk';

export const publicKeyToAddress = publicKey => {
  const { getAddressFromPubKey, ellipticEc } = AElf.wallet;

  const pubkeyByteArray = ellipticEc.keyFromPublic(publicKey, 'hex');
  const address = getAddressFromPubKey(pubkeyByteArray.pub);
  return address;
};
