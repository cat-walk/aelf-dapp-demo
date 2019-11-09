/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-09 11:56:29
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-09 16:07:04
 * @Description: file content
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { InputItem, Button, Toast, Modal, List } from 'antd-mobile';
import { createForm } from 'rc-form';

import './index.less';
import TokenContract from '@api/token';
import TokenConverterContract from '@api/tokenConverter';
import { centerEllipsis, formatToken } from '@utils/formatter';
import { TOKEN_DECIMAL } from '@constants';

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

export class ResourceMarket extends Component {
  // static propTypes = {
  //   prop: PropTypes
  // };
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      address: null,
      resourceWallet: {
        elf: {
          symbol: 'ELF',
          balance: '-'
        },
        resources: [
          {
            symbol: 'RAM',
            balance: '-'
          },
          {
            symbol: 'CPU',
            balance: '-'
          },
          {
            symbol: 'NET',
            balance: '-'
          },
          {
            symbol: 'STO',
            balance: '-'
          }
        ]
      },
      txResult: {
        elf: '-',
        amount: '-',
        txId: '-',
        blockHeight: '-'
      }
    };

    this.onResourceBuy = this.onResourceBuy.bind(this);
    this.onResourceSell = this.onResourceSell.bind(this);
  }

  async componentDidMount() {
    const { bridge } = this.props;

    await bridge.connect();

    const res = await bridge.account();
    console.log({
      res
    });
    // todo: Use a block to block the response from bridge
    const { address } = res.data.accounts[0];
    this.setState({
      address
    });

    await this.getAllBalances();
  }

  componentDidUpdate(prevProps, prevState) {
    const { bridge } = this.props;

    console.log({
      bridge
    });

    if (bridge !== prevProps.bridge) {
      this.getAllBalances();
    }
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

  async getAllBalances() {
    const { resourceWallet } = this.state;

    const allTokens = [resourceWallet.elf, ...resourceWallet.resources];
    const tokenContract = new TokenContract();

    try {
      const resArr = await Promise.all(
        allTokens.map(item => {
          return tokenContract.fetchBalance({
            symbol: item.symbol,
            owner: '2hxkDg6Pd2d4yU1A16PTZVMMrEDYEPR8oQojMDwWdax5LsBaxX'
          });
        })
      );
      console.log({
        resArr
      });

      const processedArr = resArr.map(item => {
        item.data.balance /= TOKEN_DECIMAL;
        return item.data;
      });
      this.setState({
        resourceWallet: {
          elf: processedArr[0],
          resources: processedArr.slice(1)
        }
      });
    } catch (err) {
      console.log({
        err
      });
    }
  }

  render() {
    const { getFieldProps } = this.props.form;
    const { resourceWallet, address, modalVisible } = this.state;

    const formItems = getFormItems.call(this);

    return (
      <div className='resource-market'>
        <div className='resource-wallet card-container'>
          <div className='wallet-title'>
            {address && centerEllipsis(address)}
          </div>
          <div className='wallet-balance'>
            balance: {formatToken(resourceWallet.elf.balance)}
          </div>
          <ul className='resource-item-group'>
            {resourceWallet.resources.map(item => (
              <li key={item.symbol} className='resource-item'>{`${
                item.symbol
              }: ${formatToken(item.balance)}`}</li>
            ))}
          </ul>
        </div>
        <div className='resource-trading'>
          <div className='resource-buy'>
            <div className='trading-box-header'>Buy</div>
            <InputItem
              {...getFieldProps('buyNum', {
                normalize: (v, prev) => {
                  if (v && !/^(([1-9]\d*)|0)(\.\d{0,2}?)?$/.test(v)) {
                    if (v === '.') {
                      return '0.';
                    }
                    return prev;
                  }
                  return v;
                }
              })}
              symbol={'money'}
              placeholder='money format'
              ref={el => (this.inputRef = el)}
              onVirtualKeyboardConfirm={v =>
                console.log('onVirtualKeyboardConfirm:', v)
              }
              clear
              moneyKeyboardWrapProps={moneyKeyboardWrapProps}
            >
              数字键盘
            </InputItem>
            <Button symbol='primary' onClick={this.onResourceBuy}>
              Buy
            </Button>
          </div>
          <div className='resource-sell'>
            <div className='trading-box-header'>Sell</div>
            <InputItem
              {...getFieldProps('sellNum', {
                normalize: (v, prev) => {
                  if (v && !/^(([1-9]\d*)|0)(\.\d{0,2}?)?$/.test(v)) {
                    if (v === '.') {
                      return '0.';
                    }
                    return prev;
                  }
                  return v;
                }
              })}
              symbol={'money'}
              placeholder='money format'
              ref={el => (this.inputRef = el)}
              onVirtualKeyboardConfirm={v =>
                console.log('onVirtualKeyboardConfirm:', v)
              }
              clear
              moneyKeyboardWrapProps={moneyKeyboardWrapProps}
            >
              数字键盘
            </InputItem>
            <Button symbol='primary' onClick={this.onResourceSell}>
              Sell
            </Button>
          </div>
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

const mapDispatchToProps = {};

export default createForm()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ResourceMarket)
);
