/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-08 21:10:34
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-11 19:12:16
 * @Description: file content
 */

import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Button, Toast, Modal } from 'antd-mobile';

import './index.less';
import { fetchContractAdds } from '@utils/contracts';

const clsPrefix = 'login';

class Login extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isModalShow: false,
      errors: null,
      loading: false
    };

    this.login = this.login.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
  }

  onCloseModal() {
    this.setState({
      isModalShow: false
    });
  }

  async login() {
    const { history, route, bridge } = this.props;

    this.setState({
      loading: true
    });
    const res = await bridge.account();
    const { chains } = res.data;
    // localStorage.setItem('chains', JSON.stringify(chains));
    const chainAdds = chains.map(item => item.url);
    fetchContractAdds(chainAdds)
      .then(() => {
        history.push(route);
        this.setState({
          loading: false
        });
      })
      .catch(err => {
        console.error('fetchContractAdds', err);
        this.setState({
          loading: false
        });
      });
  }

  render() {
    const { appName } = this.props;
    const { errors, isModalShow, loading } = this.state;

    return (
      <section
        className={`${clsPrefix}-container full-page-container center-container`}
      >
        <h1 className='dapp-name'>AElf {appName} Demo</h1>
        <div style={{ display: 'block', width: '100%', padding: '0 10%' }}>
          <Button
            type='primary'
            style={{ borderRadius: 20 }}
            onClick={this.login}
            loading={loading}
          >
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
