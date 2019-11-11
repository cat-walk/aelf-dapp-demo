/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-09 18:19:58
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-11 20:38:30
 * @Description: file content
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  InputItem,
  List,
  Button,
  DatePicker,
  Modal,
  ActivityIndicator
} from 'antd-mobile';
import { createForm } from 'rc-form';
import moment from 'moment';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import './index.less';
import ElectionContract from '@api/election';

const LABEL_NUM = 6;

function getFormItems() {
  const { copied } = this.state;
  const { amount, txId, blockHeight, expiredTime } = this.state.txResult;

  const formItems = [
    {
      title: 'amount',
      value: <span className='transfer-amount'>{`${amount}`}</span>,
      isCopyable: false
    },
    {
      title: 'expired time',
      value: moment(expiredTime).format('YYYY-MM-DD'),
      isCopyable: false
    },
    // {
    //   title: 'node add',
    //   value: ,
    //   isCopyable: true
    // },
    {
      title: 'tx id',
      value: (
        <CopyToClipboard
          text={txId}
          onCopy={() => this.setState({ copied: true })}
        >
          <span>
            {txId.slice(0, 10)}...
            <i className={`iconfont ${copied ? 'icon-duigou' : 'icon-copy'}`} />
          </span>
        </CopyToClipboard>
      ),
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
      copied: false,
      loading: true,
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
          this.setState({
            loading: false
          });
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
        .catch(err => {
          this.setState({
            loading: false
          });
          console.log({
            err
          });
        });
    }, 4000);
  }

  render() {
    const { getFieldProps } = this.props.form;
    const { lockTime, modalVisible, voteAmount, loading } = this.state;

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
          editable={false}
        >
          Add
        </InputItem>
        <InputItem
          type='number'
          labelNumber={LABEL_NUM}
          placeholder='input the amount'
          clear
          onBlur={v => {
            console.log('onBlur', v);
          }}
          value={voteAmount}
          onChange={voteAmount => this.setState({ voteAmount })}
        >
          Vote Amount
        </InputItem>
        {/* <p className='reciever-pubkey-tip tip-color'>
          (Only support main chain transfer) &nbsp;&nbsp;&nbsp;
        </p> */}
        <DatePicker
          mode='date'
          title='Select Date'
          extra='Select'
          value={lockTime}
          onChange={lockTime => this.setState({ lockTime })}
        >
          <List.Item arrow='horizontal'>Expired Time</List.Item>
        </DatePicker>
        {/* </List> */}
        <div className='btn-container'>
          <Button
            className='trading-btn'
            type='primary'
            onClick={this.onVoteClick}
          >
            Vote
          </Button>
        </div>

        <Modal
          visible={modalVisible}
          maskClosable={false}
          onClose={() => {
            this.setState({
              modalVisible: false,
              copied: false,
              loading: true
            });
          }}
          closable
          title='Result'
          transparent
        >
          {loading ? (
            <ActivityIndicator animating={loading} />
          ) : (
            <ul>
              {formItems.map(item => (
                <li key={item.title}>
                  <span className='item-label'>{item.title}: </span>
                  <span className='item-value'>{item.value}</span>
                </li>
              ))}
            </ul>
          )}
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
