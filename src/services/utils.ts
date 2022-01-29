import { randomBytes } from '@harmony-js/crypto/dist/random';
import { getBeaconAddress, getImplementationAddress, isBeaconProxy, isTransparentOrUUPSProxy } from "@openzeppelin/upgrades-core";

import { ethers } from "ethers";

export const uuidv4 = () => {
  return [randomBytes(4), randomBytes(4), randomBytes(4), randomBytes(4)].join('-');
};

export const getProxyAddress = async (address: string): Promise<string | null> => {
  const web3URL = process.env.REACT_APP_RPC_URL_SHARD0;

  // @ts-ignore
  const provider = new ethers.providers.JsonRpcProvider(web3URL);
  // /const provider = hmyWeb3.givenProvider;

  console.log("is proxy?", address);
  if (await isBeaconProxy(provider, address)) {
    console.log("Is Beacon Proxy");
    return await getBeaconAddress(provider, address);
  }
  else if (await isTransparentOrUUPSProxy(provider, address)) {
    console.log("Is Transparent Proxy");
    return await getImplementationAddress(provider, address);
  }
  else {
    console.log("Nope, no idea what it is");
    return null;
  }
}