/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-10-14 16:45:14
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-08 14:35:26
 * @Description: file content
 */
import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import {
  List, InputItem, Button, Toast, Modal
} from 'antd-mobile';
import { createForm } from 'rc-form';

// todo: why is the less didn't work?
import { SYMBOL, TOKEN_DECIMAL } from '@constants';
import './index.css';
import TokenContract from '@api/token';

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

const clsPrefix = 'transfer';
const LABEL_NUM = 6;

class Transfer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isModalShow: false,
      errors: [],
      transferAmount: null,
      recieverAddress: null,
      memos: null
    };

    this.jumpToTransferResult = this.jumpToTransferResult.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
  }

  onCloseModal() {
    this.setState({
      isModalShow: false
    });
  }

  jumpToTransferResult() {
    const { history } = this.props;
    const { transferAmount, recieverAddress, memo } = this.state;

    const payload = {
      to: recieverAddress,
      symbol: 'ELF',
      amount: transferAmount * TOKEN_DECIMAL,
      memo
    };
    const tokenContract = new TokenContract();

    tokenContract
      .transfer(payload)
      .then(res => {
        console.log({ res });

        // todo: Is there other nice way to write the params?
        history.push(`/transfer-result/${res.data.TransactionId}`);
      })
      .catch(err => {
        // if (res.code !== 0) {
        //   this.setState({
        //     errors: res.error,
        //     isModalShow: true
        //   });
        //   // todo: find a toast that can should multi-line
        //   // Toast.fail(
        //   //   `There are some errors:
        //   //     ${errors}`,
        //   //   3
        //   // );
        //   return;
        // }
        console.error(err);
      });
  }

  render() {
    const { getFieldProps } = this.props.form;
    const {
      isModalShow,
      errors,
      transferAmount,
      recieverAddress,
      memo
    } = this.state;

    return (
      <section
        className={`${clsPrefix}-container full-page-container center-container`}
      >
        <h3 className="title">Transfer</h3>
        <List className="transfer-form">
          <InputItem
            {...getFieldProps('money3')}
            type="digit"
            labelNumber={LABEL_NUM}
            placeholder="input the transfer amount"
            clear
            moneyKeyboardAlign="left"
            value={transferAmount}
            onChange={transferAmount => {
              this.setState({
                transferAmount: +transferAmount
              });
            }}
          >
            Amount
          </InputItem>
          <InputItem
            type="text"
            labelNumber={LABEL_NUM}
            placeholder="input the reciever address"
            clear
            onBlur={v => {
              console.log('onBlur', v);
            }}
            value={recieverAddress}
            onChange={recieverAddress => {
              this.setState({
                recieverAddress
              });
            }}
          >
            Reciever Address
          </InputItem>
          <p className="reciever-address-tip tip-color">
            (Only support main chain transfer) &nbsp;&nbsp;&nbsp;
          </p>
          <InputItem
            // {...getFieldProps('money2', {
            //   normalize: (v, prev) => {
            //     if (v && !/^(([1-9]\d*)|0)(\.\d{0,2}?)?$/.test(v)) {
            //       if (v === '.') {
            //         return '0.';
            //       }
            //       return prev;
            //     }
            //     return v;
            //   }
            // })}
            type="text"
            placeholder="input the memo"
            labelNumber={LABEL_NUM}
            ref={el => (this.inputRef = el)}
            onVirtualKeyboardConfirm={v => console.log('onVirtualKeyboardConfirm:', v)
            }
            clear
            value={memo}
            onChange={memo => {
              this.setState({
                memo
              });
            }}
          >
            Memo(Optional)
          </InputItem>
        </List>
        <div className="transfer-btn-container">
          <Button type="primary" inline onClick={this.jumpToTransferResult}>
            Next
          </Button>
        </div>
        <Modal
          visible={isModalShow}
          transparent
          maskClosable={false}
          onClose={this.onCloseModal}
          title="Failed"
          footer={[
            {
              text: 'Ok',
              onPress: () => {
                console.log('ok');
                this.onCloseModal();
              }
            }
          ]}
        >
          <p>There are some error:</p>
          {Array.isArray(errors)
            && errors.map(item => (
              <p key={item.errorCode}>
                {item.errorCode}
:
                {' '}
                {item.errorMsg}
              </p>
            ))}
        </Modal>
      </section>
    );
  }
}

export default withRouter(createForm()(Transfer));
