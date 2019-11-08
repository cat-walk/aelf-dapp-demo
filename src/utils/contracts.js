/* eslint-disable no-await-in-loop */
/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-07 16:21:26
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-07 19:55:01
 * @Description: file content
 */

import * as AElf from 'aelf-sdk';

const contractNames = [
  {
    nickName: 'consensus',
    name: 'AElf.ContractNames.Consensus'
  },
  {
    nickName: 'token',
    name: 'AElf.ContractNames.Token'
  },
  {
    nickName: 'tokenConverter',
    name: 'AElf.ContractNames.TokenConverter'
  },
  {
    nickName: 'election',
    name: 'AElf.ContractNames.Election'
  },
  {
    nickName: 'profit',
    name: 'AElf.ContractNames.Profit'
  },
  {
    nickName: 'vote',
    name: 'AElf.ContractNames.Vote'
  }
];

// const chains = localStorage.getItem('chains')

const privateKey =  '66e4918d15048730923e0decbc88e5823d394fe57e1ca1109ea713f94052705b';

const wallet = AElf.wallet.getWalletByPrivateKey(privateKey);

export const fetchContractAdds = async chains => {
  const result = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const [index, chain] of Object.entries(chains)) {
    result.push({});
    console.log('chain', chain);
    const aelf = new AElf(new AElf.providers.HttpProvider(chain));
    const { GenesisContractAddress } = await aelf.chain.getChainStatus();
    console.log('GenesisContractAddress', GenesisContractAddress);
    const genesisContract = await aelf.chain.contractAt(
      GenesisContractAddress,
      wallet
    );
    // eslint-disable-next-line no-restricted-syntax
    for (const [index01, { name: contractName, nickName }] of Object.entries(
      contractNames
    )) {
      const address = await genesisContract.GetContractAddressByName.call(
        AElf.utils.sha256(contractName)
      );
      console.log('address', address);
      result[index][nickName] = address;
    }
  }
  console.log(result);
  localStorage.setItem('contractAdds', JSON.stringify(result));
};

export const getContractAdd = contractName => JSON.parse(localStorage.getItem('contractAdds'))[0][contractName];
