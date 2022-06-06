import { randomBytes } from '@harmony-js/crypto/dist/random';
import { getBeaconAddress, getImplementationAddressFromBeacon, getImplementationAddress, isBeaconProxy, isTransparentOrUUPSProxy } from "@openzeppelin/upgrades-core";

import { ethers } from "ethers";

const SHARDS = {
  0: process.env.REACT_APP_RPC_URL_SHARD0,
  1: process.env.REACT_APP_RPC_URL_SHARD1,
  2: process.env.REACT_APP_RPC_URL_SHARD2,
  3: process.env.REACT_APP_RPC_URL_SHARD3,
}

export const uuidv4 = () => {
  return [randomBytes(4), randomBytes(4), randomBytes(4), randomBytes(4)].join('-');
};

export const getProxyAddress = async (address: string, chainType: string = "mainnet", shard: number = 0): Promise<any | null> => {
  const web3URL = chainType === "mainnet" ? SHARDS[shard] : process.env.REACT_APP_TESTNET_RPC_URL_SHARD0;

  // @ts-ignore
  const provider = new ethers.providers.JsonRpcProvider(web3URL);
  // /const provider = hmyWeb3.givenProvider;

  const result = {
    isBeacon: false,
    beaconAddress: "",
    isProxy: false,
    implementationAddress: "",
  }

  if (await isBeaconProxy(provider, address)) {
    result.isBeacon = true;
    result.beaconAddress = await getBeaconAddress(provider, address);
    result.implementationAddress = await getImplementationAddressFromBeacon(provider, result.beaconAddress);
    return result;
  }
  else if (await isTransparentOrUUPSProxy(provider, address)) {
    result.isProxy = true;
    result.implementationAddress = await getImplementationAddress(provider, address);
    return result;
  }
  else {
    return null;
  }
}