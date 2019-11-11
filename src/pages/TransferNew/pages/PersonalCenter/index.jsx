/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-10-14 16:45:14
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-11 20:06:31
 * @Description: file content
 */
import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Button, Toast, Modal } from 'antd-mobile';

// todo: why is the less didn't work?
import { centerEllipsis, formatToken } from '@utils/formatter';
import { SYMBOL } from '@constants';
import './index.less';

const clsPrefix = 'personal-center';

class PersonalCenter extends PureComponent {
  constructor(props) {
    super(props);

    this.jumpToTransfer = this.jumpToTransfer.bind(this);
    // todo: Use the common address, maybe using extends?
    this.address = localStorage.getItem('address');
  }

  jumpToTransfer() {
    const { history } = this.props;

    history.push('/transfer');
  }

  render() {
    const { balance } = this.props;

    return (
      <section
        className={`${clsPrefix}-container full-page-container center-container`}
      >
        <div className='account-name-container'>
          <span className='account-name'>
            {this.address && centerEllipsis(this.address)}
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

const mapStateToProps = state => ({
  ...state.common
});

// todo: Snippet
// const mapDispatchToProps = dispatch =>
//   bindActionCreators(
//     {
//       setBalance
//     },
//     dispatch
//   );

const wrapper = compose(
  withRouter,
  connect(
    mapStateToProps
    // mapDispatchToProps
  )
);

export default wrapper(PersonalCenter);
