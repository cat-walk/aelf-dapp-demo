/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-10-12 11:48:15
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-09 14:42:18
 * @Description: file content
 */
import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Button, Toast, Modal } from 'antd-mobile';

// todo: why is the less didn't work?
import './index.css';
import TokenContract from '@api/token';
import { TOKEN_DECIMAL } from '@constants';

const clsPrefix = 'login';

// todo: Use the common component instead
class Login extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isModalShow: false,
      errors: null
    };

    this.jumpToPersonalCenter = this.jumpToPersonalCenter.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
  }

  onCloseModal() {
    this.setState({
      isModalShow: false
    });
  }

  jumpToPersonalCenter() {
    const { history } = this.props;
    const tokenContract = new TokenContract('kangkang');

    // todo: get the owner address by api
    tokenContract
      .fetchBalance({
        symbol: 'ELF',
        owner: '2hxkDg6Pd2d4yU1A16PTZVMMrEDYEPR8oQojMDwWdax5LsBaxX'
      })
      .then(res => {
        console.log({ res });

        const { owner: accountName, balance } = res.data;
        const processedAccountInfo = {
          accountName,
          balance: balance / TOKEN_DECIMAL
        };
        history.push(
          `/personal-center/${JSON.stringify(processedAccountInfo)}`
        );
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

    // todo: Is there other nice way to write the params?
  }

  render() {
    const { errors, isModalShow } = this.state;

    return (
      <section
        className={`${clsPrefix}-container full-page-container center-container`}
      >
        <h1 className='dapp-name'>AElf Transfer Demo Dapp</h1>
        <div>
          <Button type='primary' inline onClick={this.jumpToPersonalCenter}>
            Login
          </Button>
        </div>
        <Modal
          visible={isModalShow}
          transparent
          maskClosable={false}
          onClose={this.onCloseModal}
          title='Failed'
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
          {Array.isArray(errors) &&
            errors.map(item => (
              <p key={item.errorCode}>
                {item.errorCode}: {item.errorMsg}
              </p>
            ))}
        </Modal>
      </section>
    );
  }
}

const mapStateToProps = state => ({
  ...state.common
});

const wrapper = compose(
  withRouter,
  connect(mapStateToProps)
);

export default wrapper(Login);
