import truffleSetup from './truffle';
import { verifyByteCode } from './verify';
import { getCompiledByteCode } from './bytecode';
import { getSmartContractCode } from './rpc';
import { databaseService } from '../database';
import fs from 'fs';
import path from 'path';

function cleanUp(contractAddress) {
  fs.rmdirSync(path.resolve(__dirname, contractAddress), { recursive: true });
}

type inputs = {
  contractAddress: string;
  compiler: string;
  optimizer: string;
  optimizerTimes: string;
  sourceCode: string;
  libraries: Array<string>;
  constructorArguments: string;
  contractName: string;
  chainType: string;
};

const codeVerification = async ({
  compiler,
  optimizer,
  optimizerTimes,
  sourceCode,
  libraries,
  contractAddress,
  constructorArguments,
  contractName,
  chainType,
}: inputs): Promise<boolean> => {
  try {
    if (fs.existsSync(path.resolve(__dirname, contractAddress))) {
      await cleanUp(contractAddress);
    }
    truffleSetup({
      compiler,
      optimizer,
      optimizerTimes,
      sourceCode,
      libraries,
      constructorArguments,
      contractAddress,
      contractName,
    });

    console.log('fetching actual bytecode from blockchain');
    const actualBytecode = await getSmartContractCode(chainType, contractAddress);

    if (actualBytecode === '0x') {
      throw 'Invalid Contract Address';
    }

    const { deployedBytecode, bytecode } = getCompiledByteCode({
      contractAddress,
      contractName,
    });

    console.log('Comparing the bytecodes : .......');

    const verified = verifyByteCode(actualBytecode, deployedBytecode, compiler);

    console.log('Verified: ', verified);

    if (verified) {
      let abi = fs.readFileSync(
        path.join(
          path.resolve(__dirname, contractAddress),
          'build',
          'contracts',
          `${contractName}.json`
        )
      );
      abi = JSON.parse(abi.toString()).abi;

      console.log();
      await databaseService.addContractCode({
        contractAddress,
        sourceCode,
        compiler,
        contractName,
        libraries,
        abi,
      });
    }

    console.log('deleting all the files');
    await cleanUp(contractAddress);

    return verified;
  } catch (e) {
    await cleanUp(contractAddress);
    return e;
  }
};

export default codeVerification;

// codeVerification({
//   contractAddress: "one12emqk8jvygsag8np9m78yrxk38rw3802dwga5c",
//   sourceCode: `pragma solidity >=0.4.22 <0.7.0;

//   /**
//    * @title Storage
//    * @dev Store & retreive value in a variable
//    */
//   contract Storage {

//       uint256 number;

//       /**
//        * @dev Store value in variable
//        * @param num value to store
//        */
//       function store(uint256 num) public {
//           number = num;
//       }

//       /**
//        * @dev Return value
//        * @return value of 'number'
//        */
//       function retreive() public view returns (uint256){
//           return number;
//       }
//   }`,
//   compiler: "0.6.6",
//   optimizer: "No",
//   optimizerTimes: "0",
//   libraries: [],
//   constructorArguments: "",
//   contractName: "Storage",
//   chainType: "testnet",
// });
