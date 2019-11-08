import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'antd-mobile';
import AElfBridge from 'aelf-bridge';

import { setBridge } from '../../redux/actions/common';

class SelectProxyType extends Component {
  setBridgeConfig(config) {
    const { setBridge } = this.props;

    const bridge = new AElfBridge(config);
    setBridge(bridge);
    // localStorage.setItem('hasSetProxyType', true);
  }

  render() {
    return (
      <Modal
        visible
        transparent
        title='Select Proxy Type'
        maskClosable={false}
        footer={[
          {
            text: 'SOCKET.IO',
            onPress: () => {
              this.setBridgeConfig({
                proxyType: 'SOCKET.IO',
                socketUrl: 'http://localhost:35443'
                // channelType: 'ENCRYPT'
              });
            }
          },
          {
            text: 'POST MESSAGE',
            onPress: () => {
              this.setBridgeConfig();
            }
          }
        ]}
      ></Modal>
    );
  }
}

const mapStateToProps = state => ({ ...state.common });

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      setBridge
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SelectProxyType);
