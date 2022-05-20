const fetch = require('node-fetch');
const fs = require('fs');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
/**
 * Etherscan API
    contractAddress: body.contractaddress,   //Contract Address starts with 0x...     
    sourceCode: source,             //Contract Source Code (Flattened if necessary)
    contractName: contractName,         //ContractName (if codeformat=solidity-standard-json-input, then enter contractname as ex: erc20.sol:erc20)
    compiler: body.compilerversion,          // see https://etherscan.io/solcversions for list of support versions
    optimizer: optimizer, //0 = No Optimization, 1 = Optimization used (applicable when codeformat=solidity-single-file)
    optimizerTimes: optimizerTimes,                            //set to 200 as default unless otherwise  (applicable when codeformat=solidity-single-file)        
    constructorArguments: body.constructorArguements,     //if applicable
    chainType: req.query?.network || "mainnet",
    settings
 */

test('codeVerification etherscan api should pass', () => {
  const body = {
    "chainType": "testnet",
    "contractaddress": "0xfBcbC0D214693CF4400841770c856e95cB793F4E",
    "compilerversion": "0.6.2",
    "optimizationUsed": "Yes",
    "runs": "200",
    "sourceCode": fs.readFileSync("tests/artifacts/correct.sol").toString(),
    "contractname": "SimpleToken"
  };
  const payload = {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "cache-control": "max-age=0",
      "content-type": "application/json",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
      "sec-gpc": "1"
    },
    "referrerPolicy": "no-referrer",
    "body": JSON.stringify(body),
    "method": "POST"
  }
  return fetch('http://localhost:8080/verify?network=testnet', payload).then(async (result) => {
    const json = await result.json();
    await delay(15000);

    const verified = await fetch('http://localhost:8080/verify?guid=' + json.result)
    const verifiedJson = await verified.json();
    expect(verifiedJson.status).toEqual(1);
  });
});

test('codeVerification etherscan multi-file api should pass', () => {
  const body = {
    "chainType": "testnet",
    "contractaddress": "0xfBcbC0D214693CF4400841770c856e95cB793F4E",
    "compilerversion": "0.6.2",
    "optimizationUsed": "Yes",
    "runs": "200",
    "sourceCode": JSON.stringify({
      "sources": {
        "Address.sol": {
          "content": fs.readFileSync("tests/artifacts/contracts/Address.sol").toString()
        },
        "Context.sol": {
          "content": fs.readFileSync("tests/artifacts/contracts/Context.sol").toString(),
        },
        "ERC20.sol": {
          "content": fs.readFileSync("tests/artifacts/contracts/ERC20.sol").toString(),
        },
        "IERC20.sol": {
          "content": fs.readFileSync("tests/artifacts/contracts/IERC20.sol").toString(),
        },
        "SafeMath.sol": {
          "content": fs.readFileSync("tests/artifacts/contracts/SafeMath.sol").toString(),
        },
        "SimpleToken.sol": {
          "content": fs.readFileSync("tests/artifacts/contracts/SimpleToken.sol").toString(),
        }
      },
      "settings": {
        "optimizer": {
          "enabled": true,
          "runs": 200,
        }
      }
    }),
    "contractname": "SimpleToken"
  };
  const payload = {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "cache-control": "max-age=0",
      "content-type": "application/json",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
      "sec-gpc": "1"
    },
    "referrerPolicy": "no-referrer",
    "body": JSON.stringify(body),
    "method": "POST"
  }
  return fetch('http://localhost:8080/verify?network=testnet', payload).then(async (result) => {
    const json = await result.json();
    await delay(15000);

    const verified = await fetch('http://localhost:8080/verify?guid=' + json.result)
    const verifiedJson = await verified.json();
    expect(verifiedJson.status).toEqual(1);
  });
});

test('codeVerification etherscan api should fail - incorrect bytecode', () => {
  const body = {
    "chainType": "testnet",
    "contractaddress": "0xfBcbC0D214693CF4400841770c856e95cB793F4E",
    "compilerversion": "0.6.2",
    "optimizationUsed": "Yes",
    "runs": "200",
    "sourceCode": fs.readFileSync("tests/artifacts/incorrect.sol").toString(),
    "contractname": "SimpleToken"
  };
  const payload = {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "cache-control": "max-age=0",
      "content-type": "application/json",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
      "sec-gpc": "1"
    },
    "referrerPolicy": "no-referrer",
    "body": JSON.stringify(body),
    "method": "POST"
  }
  return fetch('http://localhost:8080/verify?network=testnet', payload).then(async (result) => {
    const json = await result.json();
    await delay(15000);

    const verified = await fetch('http://localhost:8080/verify?guid=' + json.result)
    const verifiedJson = await verified.json();
    expect(verifiedJson.status).toEqual(0); // should fail
  });
});

test('codeVerification etherscan api should fail - incorrect contract name', () => {
  const body = {
    "chainType": "testnet",
    "contractaddress": "0xfBcbC0D214693CF4400841770c856e95cB793F4E",
    "compilerversion": "0.6.2",
    "optimizationUsed": "Yes",
    "runs": "200",
    "sourceCode": fs.readFileSync("tests/artifacts/incorrect.sol").toString(),
    "contractname": "SimpleTokenFailed"
  };
  const payload = {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "cache-control": "max-age=0",
      "content-type": "application/json",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
      "sec-gpc": "1"
    },
    "referrerPolicy": "no-referrer",
    "body": JSON.stringify(body),
    "method": "POST"
  }
  return fetch('http://localhost:8080/verify?network=testnet', payload).then(async (result) => {
    const json = await result.json();
    await delay(15000);

    const verified = await fetch('http://localhost:8080/verify?guid=' + json.result)
    const verifiedJson = await verified.json();
    console.log(verifiedJson);
    expect(verifiedJson.status).toEqual(0); // should fail
  });
});


test('codeVerification etherscan api with large files', () => {
  const body = {
    "chainType": "mainnet",
    "contractaddress": "0x4df7d379b921b4fca0d77ba4bd12c539df2f6e02",
    "compilerversion": "0.8.12",
    "optimizationUsed": "Yes",
    "runs": "200",
    "sourceCode": fs.readFileSync("tests/artifacts/contracts/largeFiles/flat-EnvironmentNFT.sol").toString(),
    "contractname": "EnvironmentNFT"
  };
  const payload = {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "cache-control": "max-age=0",
      "content-type": "application/json",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
      "sec-gpc": "1"
    },
    "referrerPolicy": "no-referrer",
    "body": JSON.stringify(body),
    "method": "POST"
  }
  return fetch('http://localhost:8080/verify', payload).then(async (result) => {
    const json = await result.json();
    await delay(15000);

    const verified = await fetch('http://localhost:8080/verify?guid=' + json.result)
    const verifiedJson = await verified.json();
    console.log(verifiedJson);
    expect(verifiedJson.status).toEqual(1); 
  });
});

test('codeVerification etherscan api will fail - optimisation off', () => {
  const body = {
    "chainType": "testnet",
    "contractaddress": "0xfBcbC0D214693CF4400841770c856e95cB793F4E",
    "compilerversion": "0.6.2",
    "optimizationUsed": "No",
    "runs": "0",
    "sourceCode": fs.readFileSync("tests/artifacts/correct.sol").toString(),
    "contractname": "SimpleToken"
  };
  const payload = {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "cache-control": "max-age=0",
      "content-type": "application/json",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
      "sec-gpc": "1"
    },
    "referrerPolicy": "no-referrer",
    "body": JSON.stringify(body),
    "method": "POST"
  }
  return fetch('http://localhost:8080/verify?network=testnet', payload).then(async (result) => {
    const json = await result.json();
    await delay(15000);

    const verified = await fetch('http://localhost:8080/verify?guid=' + json.result)
    const verifiedJson = await verified.json();
    // console.log(verifiedJson);
    expect(verifiedJson.message).toBe("Fail - Unable to verify")
  });
});



test('codeVerification etherscan api will fail - version incorrect', () => {
  const body = {
    "chainType": "testnet",
    "contractaddress": "0xfBcbC0D214693CF4400841770c856e95cB793F4E",
    "compilerversion": "0.6.0",
    "optimizationUsed": "No",
    "runs": "0",
    "sourceCode": fs.readFileSync("tests/artifacts/correct.sol").toString(),
    "contractname": "SimpleToken"
  };
  const payload = {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "cache-control": "max-age=0",
      "content-type": "application/json",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
      "sec-gpc": "1"
    },
    "referrerPolicy": "no-referrer",
    "body": JSON.stringify(body),
    "method": "POST"
  }
  return fetch('http://localhost:8080/verify?network=testnet', payload).then(async (result) => {
    const json = await result.json();
    await delay(15000);

    const verified = await fetch('http://localhost:8080/verify?guid=' + json.result)
    const verifiedJson = await verified.json();
    // console.log(verifiedJson);
    expect(verifiedJson.message).toBe("Fail - Unable to verify")
  });
});