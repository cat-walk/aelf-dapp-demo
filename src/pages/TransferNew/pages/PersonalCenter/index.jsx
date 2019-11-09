/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-10-14 16:45:14
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-09 15:10:23
 * @Description: file content
 */
import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Toast, Modal } from 'antd-mobile';

// todo: why is the less didn't work?
import { centerEllipsis, formatToken } from '@utils/formatter';
import { SYMBOL } from '@constants';
import './index.less';

const clsPrefix = 'personal-center';

class PersonalCenter extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      accountName: null,
      balance: null
    };

    this.jumpToTransfer = this.jumpToTransfer.bind(this);
  }

  componentDidMount() {
    const { accountName, balance } = JSON.parse(this.props.match.params.data);
    this.setState({
      accountName,
      balance
    });

    console.log({ accountName, balance, hello: 'elf' });
  }

  jumpToTransfer() {
    const { history } = this.props;

    history.push('/transfer');
  }

  render() {
    const { accountName, balance } = this.state;

    return (
      <section
        className={`${clsPrefix}-container full-page-container center-container`}
      >
        <div className='account-name-container'>
          <span className='account-name'>
            {accountName && centerEllipsis(accountName)}
          </span>
        </div>
        <div className='account-balance-container'>
          <span className='account-balance-words'>Balance: </span>
          <span className='account-balance-value'>
            {balance && formatToken(balance)}
          </span>
          <span>{SYMBOL}</span>
        </div>
        <div className='transfer-btn-container'>
          <Button type='primary' inline onClick={this.jumpToTransfer}>
            Transfer
          </Button>
        </div>
      </section>
    );
  }
}

export default withRouter(PersonalCenter);
