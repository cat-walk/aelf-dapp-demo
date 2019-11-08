/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-08 21:10:34
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-08 21:25:23
 * @Description: file content
 */

import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Button, Toast, Modal } from 'antd-mobile';

// todo: why is the less didn't work?
import './index.less';

const clsPrefix = 'login';

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
    const { history, route } = this.props;

    history.push(route);
  }

  render() {
    const { appName } = this.props;
    const { errors, isModalShow } = this.state;

    return (
      <section
        className={`${clsPrefix}-container full-page-container center-container`}
      >
        <h1 className='dapp-name'>AElf {appName} Demo</h1>
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
