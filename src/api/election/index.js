/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-07 16:01:36
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-09 21:46:41
 * @Description: file content
 */
import { getBridge } from '@utils/bridge';
import { getContractAdd } from '@utils/contracts';

// todo: How to share the bridge globally?
// Write the class as singleton mode to share the bridge and contractAdd
// Note: You can't get the bridge and contractAdd out of class/function as we get them in async way
// todo: Write a BaseBridge class that has this.bridge
export default class ElectionContract {
  static singleton = null;

  constructor() {
    if (ElectionContract.singleton) return ElectionContract.singleton;
    ElectionContract.singleton = this;

    this.bridge = getBridge();
    console.log('this.bridge', this.bridge);
    this.contractAdd = getContractAdd('election');
  }

  getElectorVoteWithAllRecords({ value }) {
    return this.bridge.invokeRead({
      contractAddress: this.contractAdd, // 合约地址
      contractMethod: 'GetElectorVoteWithAllRecords', // 合约方法名
      arguments: [
        {
          name: 'GetElectorVoteWithAllRecords',
          value: { value }
        }
      ]
    });
  }

  getPageableCandidateInformation({ start, length }) {
    return this.bridge.invokeRead({
      contractAddress: this.contractAdd, // 合约地址
      contractMethod: 'GetPageableCandidateInformation', // 合约方法名
      arguments: [
        {
          name: 'GetPageableCandidateInformation',
          value: { start, length }
        }
      ]
    });
  }

  // todo: how to write it easierly
  vote({ candidatePubkey, amount, endTimestamp }) {
    return this.bridge.invoke({
      contractAddress: this.contractAdd, // 合约地址
      contractMethod: 'Vote', // 合约方法名
      arguments: [
        {
          name: 'Vote',
          value: {
            candidatePubkey,
            amount,
            endTimestamp
          }
        }
      ]
    });
  }

  withdraw(voteId) {
    return this.bridge.invoke({
      contractAddress: this.contractAdd, // 合约地址
      contractMethod: 'Withdraw', // 合约方法名
      arguments: [
        {
          name: 'Withdraw',
          value: voteId
        }
      ]
    });
  }
}
