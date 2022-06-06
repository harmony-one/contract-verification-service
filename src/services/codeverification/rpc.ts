import axios from 'axios';
import logger from '../../logger';
const log = logger.module('verification:rpc');

export const getSmartContractCode = async (
  chain,
  address,
  compiler,
  shard = 0,
): Promise<{ bytecode: string; creationData: string }> => {
  const explorerUrl =
    chain === 'mainnet' ? process.env.EXPLORER_API_MAINNET : process.env.EXPLORER_API_TESTNET;

  let bytecode, creationData, solidityVersion;

  try {
    const contract: any = await axios.get(`${explorerUrl}/shard/${shard}/address/${address}/contract`);

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
};
