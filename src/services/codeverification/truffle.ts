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
  console.log("Language is", language);
  if (language) {
    console.log("Language is suppose to be empty but its not??");
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
  if (libraries?.length > 0) {
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

function extractFromSourcesObject(sourceCode) {
  console.log("Extracting source files from object sources");
  try {
    if (typeof (sourceCode) === "string") return null;

    let sources = sourceCode;

    const files = {};
    Object.keys(sources).forEach(source => {
      let filename;

      if (source.indexOf("\\") >= 0) {
        // windows file
        console.log("Source is windows file");
        filename = source.substring(source.lastIndexOf("\\") + 1);
      }
      else {
        filename = source.substring(source.lastIndexOf("/") + 1);
      }
      files[source] = {
        name: filename,
        fullpath: source,
        source: sources[source].content,
        mv: (name) => {
          try {
            fs.writeFileSync(
              name,
              sources[source].content
            );
          } catch (e) {
            throw "Couldn't create sol files because of " + e;
          }
        }
      };
    })
    return files;
  }
  catch (e) {
    // ignore
    console.error("Error during processing of files", e);
  }
  return null;
}

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

  if (!files) {
    files = extractFromSourcesObject(sourceCode);
  }

  if (files) { // files object exists
    await Promise.all(Object.keys(files).map(async e => {
      try {
        const dirNames = e.substring(0, e.lastIndexOf("/"));
        let dirPath;
        
        if (e.startsWith("contract")) {
          dirPath = path.join(path.resolve(__dirname, contractAddress), dirNames);
        }
        else if (dirNames.length === 0) {
          dirPath = path.join(path.resolve(__dirname, contractAddress), "contracts");
        }
        else {
          dirPath = path.join(path.resolve(__dirname, contractAddress), "node_modules", dirNames);
        }
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
        await files[e].mv(path.join(dirPath, files[e].name));
        files[e].mv = null;
        if (!files[e].source) {
          files[files[e].name] = {
            name: files[e].name,
            source: fs.readFileSync(
              path.join(
                path.resolve(__dirname, contractAddress),
                "contracts",
                files[e].name,
              )
            ).toString()
          };
          if (files[e].name !== e) {
            delete(files[e]);
          }
        }
      }
      catch (ex) {
        console.log(ex);
      }
      Promise.resolve(files[e]);
    }));
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
  return files;
};
