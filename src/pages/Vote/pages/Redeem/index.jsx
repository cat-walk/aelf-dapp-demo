/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-09 18:20:03
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-11 17:57:01
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
  Picker,
  ActivityIndicator
} from 'antd-mobile';
import { createForm } from 'rc-form';
import moment from 'moment';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const LABEL_NUM = 6;

import './index.less';
import ElectionContract from '@api/election';
import { computeRedeemableVoteRecords, getFormatedLockTime } from '@utils/time';
import { publicKeyToAddress } from '@utils/encrypt';

function getFormItems() {
  const { copied } = this.state;
  const { amount, txId, blockHeight, expiredTime } = this.state.txResult;

  const formItems = [
    // {
    //   title: 'amount',
    //   value: <span className='transfer-amount'>{`${amount}`}</span>,
    //   isCopyable: false
    // },
    // {
    //   title: 'expired time',
    //   value: expiredTime,
    //   isCopyable: false
    // },
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

export class Redeem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      copied: false,
      loading: true,
      activeVotesForOne: null,
      redeemableVotesForOne: null,
      voteAmount: null,
      lockTime: null,
      txResult: {
        amount: '-',
        txId: '-',
        blockHeight: '-',
        expiredTime: '-'
      },
      modalVisible: false,
      redeemableVoteRecordsForOneCandidate: []
    };

    this.pubkey = props.match.params.pubkey;

    this.onRedeemClick = this.onRedeemClick.bind(this);
  }

  componentDidMount() {
    const { userVotes } = this.props;
    userVotes && this.computeUserVotes();
  }

  componentDidUpdate(prevProps, prevState) {
    const { userVotes } = this.props;

    if (prevProps.userVotes !== userVotes) {
      this.computeUserVotes();
    }
  }

  computeUserVotes() {
    const { userVotes } = this.props;

    const activeVoteRecordsForOneCandidate = userVotes.activeVotingRecords.filter(
      item => item.candidate === this.pubkey
    );
    const activeVotesForOne = activeVoteRecordsForOneCandidate.reduce(
      (total, item) => total + +item.amount,
      0
    );
    const redeemableVoteRecordsForOneCandidate = computeRedeemableVoteRecords(
      activeVoteRecordsForOneCandidate
    );
    console.log(
      'redeemableVoteRecordsForOneCandidate',
      redeemableVoteRecordsForOneCandidate
    );
    const redeemableVotesForOne = redeemableVoteRecordsForOneCandidate.reduce(
      (total, item) => total + +item.amount,
      0
    );
    redeemableVoteRecordsForOneCandidate.forEach(item => {
      item.formatedLockTime = getFormatedLockTime(item);
      item.formatedVoteTime = moment
        .unix(item.voteTimestamp.seconds)
        .format('YYYY-MM-DD HH:mm:ss');
      // todo: use the name team submit instead
      item.name = publicKeyToAddress(item.candidate);

      // For display
      item.label = `amount: ${item.amount} ${item.formatedVoteTime}`;
      item.value = item.voteId;
    });

    // todo: consider to generate redeemableVoteRecordsForOneCandidate in component RedeemModal, it will reduce state's counts
    this.setState({
      activeVoteRecordsForOneCandidate,
      redeemableVoteRecordsForOneCandidate,
      activeVotesForOne,
      redeemableVotesForOne
    });
  }

  async onRedeemClick() {
    const { getFieldProps } = this.props.form;
    this.electionContract = new ElectionContract();

    const field = getFieldProps('voteToRedeem');
    const payload = field.value[0];
    console.log({
      payload
    });
    const res = await this.electionContract.withdraw(payload);
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
          const { candidatePubkey, endTimestamp } = params;

          this.setState({
            txResult: {
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
    const {
      lockTime,
      modalVisible,
      voteAmount,
      redeemableVoteRecordsForOneCandidate,
      activeVotesForOne,
      redeemableVotesForOne,
      loading
    } = this.state;

    const formItems = getFormItems.call(this);

    return (
      <div>
        <h1 className='page-title'>Redeem</h1>
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
          value={activeVotesForOne}
          editable={false}
        >
          Total Votes
        </InputItem>
        <p className='item-tip tip-color'>
          redeemable votes: {redeemableVotesForOne} &nbsp;&nbsp;&nbsp;
        </p>
        <Picker
          data={redeemableVoteRecordsForOneCandidate}
          cols={1}
          {...getFieldProps('voteToRedeem')}
          className='forss'
        >
          <List.Item arrow='horizontal'>Select Vote</List.Item>
        </Picker>
        {/* </List> */}
        <div className='btn-container'>
          <Button
            className='trading-btn'
            type='primary'
            onClick={this.onRedeemClick}
          >
            Redeem
          </Button>
        </div>
        <Modal
          visible={modalVisible}
          maskClosable={false}
          onClose={() => {
            this.setState({
              modalVisible: false,
              loading: true,
              copied: false
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

const mapStateToProps = state => ({ ...state.common, ...state.vote });

const mapDispatchToProps = {};

export default withRouter(
  createForm()(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(Redeem)
  )
);
