import { randomBytes } from '@harmony-js/crypto/dist/random';
import { getBeaconAddress, getImplementationAddressFromBeacon, getImplementationAddress, isBeaconProxy, isTransparentOrUUPSProxy } from "@openzeppelin/upgrades-core";

import { ethers } from "ethers";

const SHARDS = {
  0: process.env.REACT_APP_RPC_URL_SHARD0,
  1: process.env.REACT_APP_RPC_URL_SHARD1,
  2: process.env.REACT_APP_RPC_URL_SHARD2,
  3: process.env.REACT_APP_RPC_URL_SHARD3,
}

const DEVNET_SHARDS = {
  0: process.env.REACT_APP_DEVNET_RPC_URL_SHARD0,
  1: process.env.REACT_APP_DEVNET_RPC_URL_SHARD1,
}

function getWeb3URL({chainType, shard}): string {
  if (chainType === "mainnet") {
    return SHARDS[shard];
  }
  if (chainType === "testnet") {
    return process.env.REACT_APP_TESTNET_RPC_URL_SHARD0;
  }

  return DEVNET_SHARDS[shard]
}

export const uuidv4 = () => {
  return [randomBytes(4), randomBytes(4), randomBytes(4), randomBytes(4)].join('-');
};

export const getProxyAddress = async (address: string, chainType: string = "mainnet", shard: number = 0): Promise<any | null> => {
  const web3URL = getWeb3URL({ chainType, shard })

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