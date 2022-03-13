import { randomBytes } from '@harmony-js/crypto/dist/random';
import { getBeaconAddress, getImplementationAddressFromBeacon, getImplementationAddress, isBeaconProxy, isTransparentOrUUPSProxy } from "@openzeppelin/upgrades-core";

import { ethers } from "ethers";

export const uuidv4 = () => {
  return [randomBytes(4), randomBytes(4), randomBytes(4), randomBytes(4)].join('-');
};

export const getProxyAddress = async (address: string): Promise<any | null> => {
  const web3URL = process.env.REACT_APP_RPC_URL_SHARD0;

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
    console.log("Is Beacon Address");
    result.isBeacon = true;
    result.beaconAddress = await getBeaconAddress(provider, address);
    result.implementationAddress = await getImplementationAddressFromBeacon(provider, result.beaconAddress);
    return result;
  }
  else if (await isTransparentOrUUPSProxy(provider, address)) {
    console.log("Is Proxy (Transparent / uups)");
    result.isProxy = true;
    result.implementationAddress = await getImplementationAddress(provider, address);
    return result;
  }
  else {
    return null;
  }
}