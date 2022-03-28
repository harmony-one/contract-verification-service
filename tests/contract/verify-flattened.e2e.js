const fetch = require('node-fetch');
const fs = require('fs');

test('codeVerification should pass', () => {
  const body = {
    "chainType": "testnet",
    "contractAddress": "0xfBcbC0D214693CF4400841770c856e95cB793F4E",
    "compiler": "0.6.2",
    "optimizer": "Yes",
    "language": 0,
    "optimizerTimes": "200",
    "sourceCode": fs.readFileSync("tests/artifacts/correct.sol").toString(),
    "contractName":"SimpleToken"
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
  return fetch('http://localhost:8080/codeVerification', payload).then(async (result) => {
    const json = await result.json();
    expect(json.success).toEqual(true);
    
    const source = await fetch('http://localhost:8080/fetchContractCode?contractAddress=0xfBcbC0D214693CF4400841770c856e95cB793F4E&forced=true')
    const res = await source.json();

    expect(res.sourceCode === body.sourceCode).toEqual(true);
  });
});

test('codeVerification should fail - incorrect bytecode', () => {
  const body = {
    "chainType": "testnet",
    "contractAddress": "0xfBcbC0D214693CF4400841770c856e95cB793F4E",
    "compiler": "0.6.2",
    "optimizer": "Yes",
    "language": 0,
    "optimizerTimes": "200",
    "sourceCode": fs.readFileSync("tests/artifacts/incorrect.sol").toString(),
    "contractName":"SimpleToken"
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
  return fetch('http://localhost:8080/codeVerification', payload).then(async (result) => {
    const json = await result.json();
    expect(json.message).toEqual("Compiled bytecode do not match with bytecode from blockchain");
  });
});

test('codeVerification should fail - incorrect contract name', () => {
  const body = {
    "chainType": "testnet",
    "contractAddress": "0xfBcbC0D214693CF4400841770c856e95cB793F4E",
    "compiler": "0.6.2",
    "optimizer": "Yes",
    "language": 0,
    "optimizerTimes": "200",
    "sourceCode": fs.readFileSync("tests/artifacts/incorrect.sol").toString(),
    "contractName":"SimpleTokenFailed"
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
  return fetch('http://localhost:8080/codeVerification', payload).then(async (result) => {
    const json = await result.json();
    expect(json.message?.indexOf("ENOENT: no such file or directory, open") >= 0).toEqual(true);
  });});

  test('codeVerification should fail - incorrect compiler version', () => {
    const body = {
      "chainType": "testnet",
      "contractAddress": "0xfBcbC0D214693CF4400841770c856e95cB793F4E",
      "compiler": "0.6.0",
      "optimizer": "Yes",
      "language": 0,
      "optimizerTimes": "200",
      "sourceCode": fs.readFileSync("tests/artifacts/incorrect.sol").toString(),
      "contractName":"SimpleToken"
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
    return fetch('http://localhost:8080/codeVerification', payload).then(async (result) => {
      const json = await result.json();
      expect(Object.keys(json).length).toEqual(0);
    });
  });

  test('codeVerification should fail - incorrect optimizer (no)', () => {
    const body = {
      "chainType": "testnet",
      "contractAddress": "0xfBcbC0D214693CF4400841770c856e95cB793F4E",
      "compiler": "0.6.2",
      "optimizer": "No",
      "language": 0,
      "optimizerTimes": "200",
      "sourceCode": fs.readFileSync("tests/artifacts/incorrect.sol").toString(),
      "contractName":"SimpleToken"
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
    return fetch('http://localhost:8080/codeVerification', payload).then(async (result) => {
      const json = await result.json();
      expect(json.message).toEqual("Compiled bytecode do not match with bytecode from blockchain");
    });
  });



  test('codeVerification should fail - incorrect optimizerTimes', () => {
    const body = {
      "chainType": "testnet",
      "contractAddress": "0xfBcbC0D214693CF4400841770c856e95cB793F4E",
      "compiler": "0.6.2",
      "optimizer": "Yes",
      "language": 0,
      "optimizerTimes": "50",
      "sourceCode": fs.readFileSync("tests/artifacts/incorrect.sol").toString(),
      "contractName":"SimpleToken"
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
    return fetch('http://localhost:8080/codeVerification', payload).then(async (result) => {
      const json = await result.json();
      expect(json.message).toEqual("Compiled bytecode do not match with bytecode from blockchain");
    });
  });