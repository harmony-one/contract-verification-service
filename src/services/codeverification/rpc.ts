import axios from 'axios';
import logger from '../../logger';

const log = logger.module('verification:rpc');

function getExplorerUrl(chain: string, shard?: string): string {
  if (chain === 'mainnet') {
    return process.env.EXPLORER_API_MAINNET;
  }
  if (chain === 'testnet') {
    return process.env.EXPLORER_API_TESTNET;
  }
  if (+shard === 0) {
    return process.env.REACT_APP_DEVNET_RPC_URL_SHARD0;
  }

  return process.env.REACT_APP_DEVNET_RPC_URL_SHARD1;
}

function getExplorerApiKey(chain: string, shard?: string): string {
  if (chain === 'mainnet') {
    return process.env[`EXPLORER_API_KEY_MAINNET_${shard || '0'}`];
  }
  if (chain === 'testnet') {
    return process.env.EXPLORER_API_KEY_TESTNET;
  }
  
}

async function getDataFromWS({ chain, address, shard }) {
  const body = {
    jsonrpc: '2.0',
    id: 1,
    method: "hmy_getCode",
    params: [address, "latest"]
  };

  const result: any = await axios.post(getExplorerUrl(chain, shard), body);

  return {
    bytecode: result.data.result,
    creationData: "",
  }
}

async function getContractCode({ chain, address, shard, compiler }): Promise<{ bytecode: string; creationData: string }> {

  if (chain === 'devnet') {
    return await getDataFromWS({ chain, address, shard });
  }
  const explorerUrl = getExplorerUrl(chain);

  let bytecode, creationData, solidityVersion;

  try {
    // 
    const config = {
      headers: {
        'rest_api_key': getExplorerApiKey(chain, shard)
      }
    }
    const contract: any = await axios.get(`${explorerUrl}/shard/${shard}/address/${address}/contract`, config);

    bytecode = contract.data.bytecode;

    solidityVersion = contract.data.solidityVersion;

    const tx: any = await axios.get(
      `${explorerUrl}/shard/${shard}/transaction/hash/${contract.data.transactionHash}`
    );

    creationData = tx.data.input;
  } catch (e) {
    log.error('Error to fetch contract bytecode', { error: e });
    throw new Error('Contract not found');
  }

  if (solidityVersion !== compiler) {
    // throw new Error('Compiler versions do not match');
  }

  return { bytecode, creationData };
}

export const getSmartContractCode = async (
  chain,
  address,
  compiler,
  shard = 0,
): Promise<{ bytecode: string; creationData: string }> => {
  return getContractCode({ chain, address, compiler, shard })
};
