import truffleSetup from "./truffle";
import { verifyByteCode } from "./verify";
import { getCompiledByteCode } from "./bytecode";
import { getSmartContractCode } from "./rpc";
import { databaseService } from "../database";
import fs from "fs";
import path from "path";
import { getAddress, isValidChecksumAddress } from "@harmony-js/crypto";
import logger from "../../logger";
const log = logger.module("verification:index");

const cleanUp = async (contractAddress) => {
  if (await fs.existsSync(path.resolve(__dirname, contractAddress))) {
    try {
      await fs.rmdirSync(path.resolve(__dirname, contractAddress), {
        recursive: true,
      });
    } catch (e) {
      log.error("cleanUp error", { error: e });
    }
  }
};

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
  language: number;
};

const codeVerification = async ({
  compiler,
  optimizer,
  optimizerTimes,
  sourceCode,
  libraries,
  contractAddress: contractAddressParams,
  constructorArguments,
  contractName,
  chainType = "mainnet",
  language,
}: inputs): Promise<boolean> => {
  if (!compiler) {
    throw new Error("Wrong Compiler");
  }

  if (!sourceCode) {
    throw new Error("Wrong Source code");
  }

  if (!contractName) {
    throw new Error("Wrong Contract name");
  }

  isValidChecksumAddress(contractAddressParams);

  const contractAddress = getAddress(
    contractAddressParams
  ).checksum.toLowerCase();

  try {
    console.log("fetching actual bytecode from blockchain");
    const chainData = await getSmartContractCode(
      chainType,
      contractAddress,
      compiler
    );

    if (!chainData.bytecode) {
      throw new Error("Bytecode not found");
    }

    await cleanUp(contractAddress);

    truffleSetup({
      compiler,
      optimizer,
      optimizerTimes,
      sourceCode,
      libraries,
      constructorArguments,
      contractAddress,
      contractName,
      language,
    });

    if (chainData.bytecode === "0x") {
      throw "Invalid Contract Address";
    }

    const compiledData = getCompiledByteCode({
      contractAddress,
      contractName,
    });

    console.log("Comparing the bytecodes : .......");

    const verified = verifyByteCode(
      chainData,
      compiledData,
      constructorArguments,
      compiler
    );

    console.log("Verified: ", verified);

    if (!verified) {
      throw new Error(
        "Compiled bytecode do not match with bytecode from blockchain"
      );
    }

    if (verified) {
      let abi = fs.readFileSync(
        path.join(
          path.resolve(__dirname, contractAddress),
          "build",
          "contracts",
          `${contractName}.json`
        )
      );
      abi = JSON.parse(abi.toString()).abi;

      await databaseService.addContractCode({
        contractAddress,
        sourceCode,
        compiler,
        constructorArguments,
        contractName,
        libraries,
        abi,
      });
    }

    console.log("deleting all the files");
    await cleanUp(contractAddress);

    return verified;
  } catch (e) {
    await cleanUp(contractAddress);

    log.error("Error", {
      error: e,
      params: {
        compiler,
        optimizer,
        optimizerTimes,
        sourceCode,
        libraries,
        contractAddress,
        constructorArguments,
        contractName,
        chainType,
      },
    });

    throw e;
  }
};

export default codeVerification;
