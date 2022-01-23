import fs from "fs";
import path from "path";

import { execSync } from "child_process";
import logger from "../../logger";
import replace from "replace-in-file";
const log = logger.module("verification:core");

type Value = {
  compiler: string;
  optimizer: string;
  optimizerTimes: string;
  language: number;
};

const truffleConfig = ({
  compiler,
  optimizer = "No",
  optimizerTimes = "0",
  language = 0
}: Value): string => {
  if (language) {
    return `
    module.exports = {
    }`
  }
  if (["Yes", "yes", true].includes(optimizer)) {
    return `
    module.exports = {
      compilers:{
        solc: {
          version: "${compiler}",
          settings: {
            optimizer:{
              enabled: ${["Yes", "yes", true].includes(optimizer) ? true : false
            },
              runs: ${optimizerTimes}
            }
          }
        }
      }
    }`;
  } else {
    return `
    module.exports = {
      compilers:{
        solc: {
          version: "${compiler}"
        }
      }
    }`;
  }
};

const createConnfiguration = ({
  optimizer,
  optimizerTimes,
  libraries,
  constructorArguments,
  compiler,
  contractAddress,
  language
}): void => {
  if (!compiler) {
    throw new Error("No Solidity version specified");
  }

  console.log("Creating truffle project....");
  execSync(`npx truffle init ${path.resolve(__dirname, contractAddress)}`);

  console.log("Creating truffle configuration");
  const config = truffleConfig({ compiler, optimizer, optimizerTimes, language });
  fs.writeFileSync(
    path.join(path.resolve(__dirname, contractAddress), "truffle-config.js"),
    config
  );
};

const createSolFileFromSource = ({
  sourceCode,
  contractAddress,
  contractName,
}) => {
  console.log("Creating sol file from source");
  try {
    fs.writeFileSync(
      path.join(
        path.resolve(__dirname, contractAddress),
        "contracts",
        `${contractName}.sol`
      ),
      sourceCode
    );

    fs.unlinkSync(
      path.join(
        path.resolve(__dirname, contractAddress),
        "contracts",
        "Migrations.sol"
      )
    );
  } catch (e) {
    throw "Couldn't create sol files";
  }
};

//  truffle unbox vyper-example

const createVyFileFromSource = ({
  sourceCode,
  contractAddress,
  contractName,
}) => {
  console.log("Creating vy file from source");
  try {
    fs.writeFileSync(
      path.join(
        path.resolve(__dirname, contractAddress),
        "contracts",
        `${contractName}.vy`
      ),
      sourceCode
    );

    fs.unlinkSync(
      path.join(
        path.resolve(__dirname, contractAddress),
        "contracts",
        "Migrations.sol"
      )
    );
  } catch (e) {
    console.log("Error!", e);
    throw "Couldn't create vy file";
  }
};

export const installDependencies = ({ libraries, contractAddress }) => {
  if (libraries.length > 0) {
    const dependencies = libraries.toString().replace(/\,/g, " ");
    console.log(dependencies);
    try {
      execSync(
        `pwd && cd ${path.resolve(
          __dirname,
          contractAddress
        )} && npm install ${dependencies}`
      );
    } catch (e) {
      throw "Dependency issue";
    }
  }
};

export const compile = (directory: string) => {
  try {
    execSync(`cd ${path.resolve(__dirname, directory)} && truffle compile`);
    console.log("Success - compiled!");
  } catch (e) {
    log.error("Compilation issue", { error: e });

    throw "compilation issue: " + (e ? e.message : "");
  }
};

type inputs = {
  compiler: string;
  optimizer: string;
  optimizerTimes: string;
  sourceCode: string;
  libraries: Array<string>;
  constructorArguments: string;
  contractAddress: string;
  contractName: string;
  language: number; // 0: solidity 1: viper,
  files: object; // files as per express-fileupload (https://github.com/richardgirges/express-fileupload)
};

export default async ({
  compiler,
  optimizer,
  optimizerTimes,
  sourceCode,
  files,
  libraries,
  constructorArguments,
  contractAddress,
  contractName,
  language = 0
}: inputs) => {
  createConnfiguration({
    optimizer,
    optimizerTimes,
    libraries,
    constructorArguments,
    compiler,
    contractAddress,
    language
  });

  console.log("Installing dependencies...");
  installDependencies({ libraries, contractAddress });

  console.log("Generating contract file");
  if (files) { // files object exists
    Object.keys(files).forEach(e => {
      files[e].mv("./" + contractAddress + "/contracts/" + files[e].name);
    });

    /// if libraries are provided, maybe they included openzepelin, in that case we don't include
    /// any imports with @ in the name
    const options = {
      files: [
        './' + contractAddress + '/contracts/*.sol'
      ],
      from: libraries && libraries?.length > 0 ? /import \"[.|\/|\w]+\//g : /import \"[@|.|\/|\w]+\//g,
      to: 'import "./'
    }

    console.log("File updated with regex", options, replace.sync(options));

  }
  else if (!language) {
    createSolFileFromSource({
      sourceCode,
      contractAddress,
      contractName,
    });
  } else {
    createVyFileFromSource({ sourceCode, contractAddress, contractName });
  }

  console.log("Compiling.....");
  compile(contractAddress);
};
