/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-09 18:19:58
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-09 20:05:57
 * @Description: file content
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { InputItem, List, Button, DatePicker, Modal } from 'antd-mobile';
import { createForm } from 'rc-form';
import moment from 'moment';

const LABEL_NUM = 6;

import './index.less';
import ElectionContract from '@api/election';

function getFormItems() {
  const { amount, txId, blockHeight, expiredTime } = this.state.txResult;

  const formItems = [
    {
      title: 'amount',
      value: <span className='transfer-amount'>{`${amount}`}</span>,
      isCopyable: false
    },
    {
      title: 'expired time',
      value: expiredTime,
      isCopyable: false
    },
    // {
    //   title: 'node add',
    //   value: ,
    //   isCopyable: true
    // },
    {
      title: 'tx id',
      value: txId,
      isCopyable: true
    },
    {
      title: 'block height',
      value: blockHeight,
      isCopyable: false
    }
  ];

  return formItems;
}

export class Vote extends Component {
  constructor(props) {
    super(props);
    this.state = {
      voteAmount: null,
      lockTime: null,
      txResult: {
        amount: '-',
        txId: '-',
        blockHeight: '-',
        expiredTime: '-'
      },
      modalVisible: false
    };

    this.pubkey = props.match.params.pubkey;

    this.onVoteClick = this.onVoteClick.bind(this);
  }

  async onVoteClick() {
    const { voteAmount } = this.state;
    let { lockTime } = this.state;
    console.log({
      voteAmount
    });

    this.electionContract = new ElectionContract();

    lockTime = moment(lockTime);
    const payload = {
      candidatePubkey: this.pubkey,
      amount: voteAmount,
      endTimestamp: {
        seconds: lockTime.unix(),
        nanos: lockTime.milliseconds() * 1000
      }
    };

    const res = await this.electionContract.vote(payload);
    console.log({
      vote: res
    });
    this.setState({
      modalVisible: true
    });
    this.fetchTxResult(res.data.TransactionId);
  }

  fetchTxResult(txId) {
    const { bridge } = this.props;

    setTimeout(() => {
      const payload = {
        txId
      };
      bridge
        .api({
          apiPath: '/api/blockChain/transactionResult', // api路径
          arguments: [
            {
              name: 'transactionResult',
              value: txId
            }
          ]
        })
        .then(res => {
          console.log({
            res
          });
          if (res.code !== 0) {
            this.setState({
              errors: res.error,
              isModalShow: true,
              loading: false
            });
            // todo: find a toast that can should multi-line
            // Toast.fail(
            //   `There are some errors:
            //     ${errors}`,
            //   3
            // );
            return;
          }

          console.log({
            res
          });

          const { Status: status, TransactionId } = res.data;
          const { RefBlockNumber: blockHeight } = res.data.Transaction;
          const params = JSON.parse(res.data.Transaction.Params);
          const { amount, candidatePubkey, endTimestamp } = params;

          this.setState({
            txResult: {
              amount: +amount,
              // elf: 123,
              txId: TransactionId,
              blockHeight,
              status,
              nodeAdd: candidatePubkey,
              expiredTime: endTimestamp
            }
          });

          console.log("I'm success");
        })
        .catch(err =>
          console.log({
            err
          })
        );
    }, 4000);
  }

  render() {
    const { getFieldProps } = this.props.form;
    const { lockTime, modalVisible, voteAmount } = this.state;

    const formItems = getFormItems.call(this);

    return (
      <div>
        <h1 className='page-title'>Vote</h1>
        {/* <List className='transfer-form'> */}
        <InputItem
          {...getFieldProps('money3')}
          labelNumber={LABEL_NUM}
          placeholder='input the transfer amount'
          clear
          moneyKeyboardAlign='left'
          value={this.pubkey}
        >
          Add
        </InputItem>
        <InputItem
          type='number'
          labelNumber={LABEL_NUM}
          placeholder='input the reciever pubkey'
          clear
          onBlur={v => {
            console.log('onBlur', v);
          }}
          value={voteAmount}
          onChange={voteAmount => this.setState({ voteAmount })}
        >
          Vote Amount
        </InputItem>
        <p className='reciever-pubkey-tip tip-color'>
          (Only support main chain transfer) &nbsp;&nbsp;&nbsp;
        </p>
        <DatePicker
          mode='date'
          title='Select Date'
          extra='Optional'
          value={lockTime}
          onChange={lockTime => this.setState({ lockTime })}
        >
          <List.Item arrow='horizontal'>Date</List.Item>
        </DatePicker>
        {/* </List> */}
        <div className='transfer-btn-container'>
          <Button type='primary' onClick={this.onVoteClick}>
            Vote
          </Button>
        </div>

        <Modal
          visible={modalVisible}
          maskClosable={false}
          onClose={() => {
            this.setState({
              modalVisible: false
            });
          }}
          closable
          title='result'
          transparent
        >
          {formItems.map(item => (
            <List.Item extra={item.value} key={item.title}>
              {item.title}:
            </List.Item>
          ))}
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = state => ({ ...state.common });

const mapDispatchToProps = {};

export default withRouter(
  createForm()(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(Vote)
  )
);
