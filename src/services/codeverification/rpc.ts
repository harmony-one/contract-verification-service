// @ts-nocheck
import { Harmony } from '@harmony-js/core';
import { ChainID, ChainType } from '@harmony-js/utils';
import { toBech32 } from '@harmony-js/crypto';

const rpcUrl = {
  testnet: 'https://api.s0.b.hmny.io/',
  mainnet: 'https://api.s0.t.hmny.io/',
};

const testnet = new Harmony(rpcUrl.testnet, {
  chainType: ChainType.Harmony,
  chainId: ChainID.HmyTestnet,
});

const mainnet = new Harmony(rpcUrl.mainnet, {
  chainType: ChainType.Harmony,
  chainId: ChainID.HmyMainnet,
});

export const getSmartContractCode = async (chain, address): Promise<any> => {
  const hmy = chain === 'mainnet' ? mainnet : testnet;
  // const finalAddress = address.startsWith("0x") ? toBech32(address) : address;
  const response = await hmy.blockchain.getCode({
    address,
    blockNumber: 'latest',
  });
  return response.result;
};
