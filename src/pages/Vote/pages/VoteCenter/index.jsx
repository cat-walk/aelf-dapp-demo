/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-09 11:56:29
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-11 18:07:14
 * @Description: file content
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { InputItem, Button, Toast, Modal, List } from 'antd-mobile';
import { createForm } from 'rc-form';

import './index.less';
import TokenContract from '@api/token';
import ElectionContract from '@api/election';
import { centerEllipsis, formatToken } from '@utils/formatter';
import { TOKEN_DECIMAL } from '@constants';
import { setUserVotes } from '@redux/actions/vote';

const { Item } = List;

// 通过自定义 moneyKeyboardWrapProps 修复虚拟键盘滚动穿透问题
// https://github.com/ant-design/ant-design-mobile/issues/307
// https://github.com/ant-design/ant-design-mobile/issues/163
const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(
  window.navigator.userAgent
);
let moneyKeyboardWrapProps;
if (isIPhone) {
  moneyKeyboardWrapProps = {
    onTouchStart: e => e.preventDefault()
  };
}

function getFormItems() {
  const { amount, txId, elf, blockHeight } = this.state.txResult;

  const formItems = [
    {
      title: 'amount',
      value: <span className='transfer-amount'>{`${amount}`}</span>,
      isCopyable: false
    },
    // {
    //   title: 'miner fee',
    //   value: minerFee,
    //   isCopyable: false
    // },
    // {
    //   title: 'elf',
    //   value: elf,
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

export class VoteCenter extends Component {
  // static propTypes = {
  //   prop: PropTypes
  // };
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      address: null,
      balance: '-',
      totalVoteAmount: '-',
      totalRedeemAmount: '-',
      txResult: {
        elf: '-',
        amount: '-',
        txId: '-',
        blockHeight: '-'
      },
      pubkey: '-',
      nodesData: []
    };

    this.onVoteClick = this.onVoteClick.bind(this);
    this.onRedeemClick = this.onRedeemClick.bind(this);
  }

  async componentDidMount() {
    const { bridge } = this.props;

    await bridge.connect();

    const res = await bridge.account();
    console.log({
      res
    });
    // todo: Use a block to block the response from bridge
    const { address, pubkey } = res.data.accounts[0];
    this.setState({
      address,
      pubkey
    });

    await this.getBalance();

    await this.fetchUserVoteRecords();

    await this.fetchNodesData();
  }

  componentDidUpdate(prevProps, prevState) {
    const { bridge } = this.props;

    console.log({
      bridge
    });

    if (bridge !== prevProps.bridge) {
      // this.getAllBalances();
    }
  }

  async fetchUserVoteRecords() {
    const { setUserVotes } = this.props;
    const { pubkey } = this.state;
    this.electionContract = new ElectionContract();
    console.log({
      setUserVotes
    });
    try {
      const res = await this.electionContract.getElectorVoteWithAllRecords({
        value: pubkey
      });

      setUserVotes({
        userVotes: res.data
      });

      const { activeVotedVotesAmount, withdrawnVotesRecords } = res.data;

      console.log({
        fetchUserVoteRecords: res
      });

      const totalRedeemAmount = withdrawnVotesRecords.reduce(
        (total, current) => total + +current.amount,
        0
      );

      this.setState({
        totalVoteAmount: activeVotedVotesAmount,
        totalRedeemAmount
      });
    } catch (err) {
      console.log({
        err
      });
    }
  }

  async fetchNodesData() {
    const res = await this.electionContract.getPageableCandidateInformation({
      start: 0,
      length: 1000000
    });
    console.log({
      res
    });
    const nodesData = res.data.value
      .sort((a, b) => +b.obtainedVotesAmount - +a.obtainedVotesAmount)
      .map((item, index) => {
        item.rank = index + 1;
        return { ...item, ...item.candidateInformation };
      });
    this.setState({
      nodesData
    });
  }

  displayModal() {
    this.setState({
      modalVisible: true
    });
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
          const { amount, symbol } = params;

          this.setState({
            txResult: {
              amount: +amount / TOKEN_DECIMAL,
              // elf: 123,
              txId: TransactionId,
              blockHeight,
              status,
              loading: false
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

  onResourceBuy() {
    const { getFieldProps } = this.props.form;

    const buyNumField = getFieldProps('buyNum');
    this.buyResource(+buyNumField.value);
  }

  async buyResource(buyNum) {
    const tokenConverterContract = new TokenConverterContract();

    const res = await tokenConverterContract.buy({
      symbol: 'CPU',
      amount: buyNum * TOKEN_DECIMAL
    });
    await this.fetchTxResult(res.data.TransactionId);
    await this.displayModal();

    console.log({ buyNum, res });
  }

  onResourceSell() {
    const { getFieldProps } = this.props.form;

    const sellNumField = getFieldProps('sellNum');
    this.sellResource(+sellNumField.value);
  }

  async sellResource(sellNum) {
    const tokenConverterContract = new TokenConverterContract();

    const res = await tokenConverterContract.sell({
      symbol: 'CPU',
      amount: sellNum * TOKEN_DECIMAL
    });

    await this.fetchTxResult(res.data.TransactionId);
    await this.displayModal();

    console.log({ sellNum, res });
  }

  onVoteClick(address) {
    const { history } = this.props;
    console.log({
      address
    });

    history.push(`/vote/${address}`);
  }

  onRedeemClick(address) {
    const { history } = this.props;

    history.push(`/redeem/${address}`);
  }

  async getBalance() {
    const tokenContract = new TokenContract();

    const res = await tokenContract.fetchBalance({
      symbol: 'ELF',
      owner: address
    });
    console.log({
      res
    });

    this.setState({
      balance: res.data.balance / TOKEN_DECIMAL
    });
  }

  render() {
    const { getFieldProps } = this.props.form;
    const {
      address,
      modalVisible,
      balance,
      totalRedeemAmount,
      totalVoteAmount,
      nodesData
    } = this.state;

    const formItems = getFormItems.call(this);

    return (
      <div className='resource-market'>
        <div className='resource-wallet card-container'>
          <div className='wallet-title'>
            {address && centerEllipsis(address)}
          </div>
          <div className='wallet-balance'>balance: {formatToken(balance)}</div>
          <ul className='resource-item-group'>
            <li className='resource-item'>{`total votes: ${formatToken(
              totalVoteAmount.toLocaleString()
            )}`}</li>
            <li className='resource-item'>{`total redeems: ${formatToken(
              totalRedeemAmount.toLocaleString()
            )}`}</li>
          </ul>
        </div>
        <h1 className='card-title page-wrapper'>Nodes List</h1>
        <div className='node-group-container'>
          <ul className='node-group'>
            {nodesData.map(item => {
              return (
                <li className='node-item card-container'>
                  <div className='node-rank'>{item.rank}</div>
                  <div className='node-name ellipsis'>{item.pubkey}</div>
                  <div className='node-votes'>
                    votes: {item.obtainedVotesAmount}
                  </div>
                  <div className='btn-group'>
                    <Button
                      className='round-btn vote-btn'
                      type='primary'
                      size='small'
                      inline
                      onClick={() => {
                        this.onVoteClick(item.pubkey);
                      }}
                    >
                      Vote
                    </Button>
                    <Button
                      className='round-btn redeem-btn'
                      type='primary'
                      size='small'
                      inline
                      onClick={() => {
                        this.onRedeemClick(item.pubkey);
                      }}
                    >
                      Redeem
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
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
            <Item extra={item.value} key={item.title}>
              {item.title}:
            </Item>
          ))}
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = state => ({ ...state.common });

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      setUserVotes
    },
    dispatch
  );
};

const wrapper = compose(
  createForm(),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
);

export default wrapper(VoteCenter);
