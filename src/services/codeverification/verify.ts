// https://www.badykov.com/ethereum/2019/08/22/solidity-bytecode-metadata/
// https://www.shawntabrizi.com/ethereum/verify-ethereum-contracts-using-web3-js-and-solc/
export function verifyByteCode(
  chainData: { bytecode: string; creationData: string },
  recompiled: { deployedBytecode: string; bytecode: string },
  constructorArguments: string,
  contractAddress: string,
  solidityVersion,
  language = 0,
) {
  try {
    if (chainData.bytecode === recompiled.deployedBytecode) {
      return true;
    }

    const trimmedDeployedBytecode = language === 0 ? trimMetadata(chainData.bytecode, contractAddress) : chainData.bytecode;
    const trimmedCompiledRuntimeBytecode = language === 0 ? trimMetadata(recompiled.deployedBytecode, contractAddress) : recompiled.deployedBytecode;

    if (trimmedDeployedBytecode === trimmedCompiledRuntimeBytecode) {
      // partial
      return true;
    }

    if (trimmedDeployedBytecode.length === trimmedCompiledRuntimeBytecode.length) {
      if (chainData.creationData) {
        // The reason why this uses `startsWith` instead of `===` is that
        // creationData may contain constructor arguments at the end part.
        const clearChainByteCode = chainData.creationData.replace(constructorArguments, '');

        if (clearChainByteCode === recompiled.bytecode) {
          return true;
        }

        if (language === 0 && trimMetadata(recompiled.bytecode, contractAddress) === trimMetadata(clearChainByteCode, contractAddress)) {
          // partial
          return true;
        }

        // const trimmedCompiledCreationBytecode = trimMetadata(recompiled.bytecode);
        //
        // if (chainData.creationData.startsWith(trimmedCompiledCreationBytecode)) {
        //   // partial
        //   return true;
        // }
      }
    }

    return false;

    // return Buffer.compare(compiled, deployed) === 0;
  } catch (e) {
    throw 'Verify Error. Invalid bytecode';
  }
}

function arrayify(code) {
  if (!(code.substring(0, 2) == '0x')) throw new Error('Bytecode does not start with 0x');
  const hex = (<string>code).substring(2);
  const result = [];
  for (let i = 0; i < hex.length; i += 2) {
    result.push(parseInt(hex.substring(i, i + 2), 16));
  }
  return new Uint8Array(result); // has slice function already
}

// according to https://docs.soliditylang.org/_/downloads/en/v0.4.6/pdf/ there is no contract metadata, a sentiment echoed by link #2 above
// metadata is embedded in the contract starting from solidity v0.4.7 https://docs.soliditylang.org/_/downloads/en/v0.4.7/pdf/
export function splitByteCodeLegacy(providedByteCode, solidityVersion) {
  const solidityMinorVersion = +solidityVersion.split('.')[1];
  const solidityPatchVersion = +solidityVersion.split('.')[2];
  let bytecode;
  try {
    if (!(solidityMinorVersion >= 4 && solidityPatchVersion >= 7) || solidityMinorVersion >= 5) {
      const buffer = Buffer.from(arrayify(providedByteCode));
      const metadataLength = buffer.readIntBE(buffer.length - 2, 2); // "Since the beginning of that encoding is not easy to find, its length is added in a two-byte big-endian encoding"
      bytecode = buffer.slice(0, buffer.length - metadataLength - 2);

      // Last 4 chars of bytecode specify byte size of metadata component,
      const metadataSize = parseInt(bytecode.slice(-4), 16) * 2 + 4;
      return bytecode.slice(0, bytecode.length - metadataSize);
    } else {
      bytecode = Buffer.from(arrayify(providedByteCode));
    }
    return bytecode;
  } catch (e) {
    console.log(e);
    throw new Error('Cant split bytecode into bytecode and metadata');
  }
}

export function trimMetadata(bytecode: string, contractAddress: string): string {
  // Last 4 chars of bytecode specify byte size of metadata component,
  // console.log('pfff: ', bytecode.slice(-4), parseInt(bytecode.slice(-4), 16) * 2 + 4);
  const metadataSize = parseInt(bytecode.slice(-4), 16) * 2 + 4;
  
  // console.log('metadataSize: ', metadataSize);
  
  bytecode = bytecode.slice(0, bytecode.length - metadataSize);
  
  // find bytecode https://ethereum.stackexchange.com/questions/110991/how-to-verify-smart-contracts-on-different-solidity-versions/111001#111001
  // legacy 0.4.24 or prior (0xa1 0x65 <> 0x00 0x29)
  const legacyMeta = bytecode.indexOf("a165");
  const currentMeta = bytecode.indexOf("a264");
  const otherMeta = bytecode.indexOf("a265");
  if (legacyMeta > 0) {
    const last = bytecode.indexOf("0029", legacyMeta);
    if (last > 0) {
      bytecode = bytecode.replace(bytecode.substring(legacyMeta, last + 4), "");
    }
  }
  // current after 0.4.24 (0xa2 0x64 <> 0x00 0x33)
  else if (currentMeta > 0) { 
    const last = bytecode.indexOf("0033", currentMeta);
    if (last > 0) {
      bytecode = bytecode.replace(bytecode.substring(currentMeta, last + 4), "");
    }
  }
  // current for 0.5.x (0xa2 0x65 <> 0x32) although we should consider the cbor values
  else if (otherMeta > 0) {
    const last = bytecode.indexOf("0032", otherMeta);
    if (last > 0) {
      bytecode = bytecode.replace(bytecode.substring(otherMeta, last + 4), "");
    }
  }

  if (bytecode.indexOf(contractAddress.replace('0x', ''))) {
    const addr = contractAddress.replace('0x', '')
    bytecode = bytecode.replaceAll(addr, new Array(addr.length + 1).join('0'))
  }

  return bytecode;
}
