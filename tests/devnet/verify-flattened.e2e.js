const fetch = require('node-fetch');
const fs = require('fs');

test('codeVerification (devnet) should pass', () => {
  const body = {
    "chainType": "devnet",
    "contractAddress": "0xb9318826CA4fe0402d093b4ca8dB2312014e1C02",
    "compiler": "0.6.2",
    "optimizer": "No",
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
    console.log(json)
    expect(json.success).toEqual(true);
    
    const source = await fetch('http://localhost:8080/fetchContractCode?contractAddress=0xb9318826CA4fe0402d093b4ca8dB2312014e1C02&forced=true')
    const res = await source.json();

    expect(res.sourceCode === body.sourceCode).toEqual(true);
  });
});

test('codeVerification (devnet) should pass - version 0.5.16', () => {
  const body = {
    "chainType": "devnet",
    "contractAddress": "0xB5260B62A407406e60963635EfCA3b25D4626193",
    "compiler": "0.5.16",
    "optimizer": "No",
    "language": 0,
    "optimizerTimes": "200",
    "sourceCode": fs.readFileSync("tests/artifacts/contracts/0.5.x/UniswapV2Factory.sol").toString(),
    "contractName":"UniswapV2Factory"
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
    console.log(json);
    expect(json.success).toEqual(true);
    
    const source = await fetch('http://localhost:8080/fetchContractCode?contractAddress=0xB5260B62A407406e60963635EfCA3b25D4626193&forced=true')
    const res = await source.json();
    expect(res.sourceCode === body.sourceCode).toEqual(true);
  });
});

test('codeVerification (devnet) should fail - incorrect bytecode', () => {
  const body = {
    "chainType": "devnet",
    "contractAddress": "0xb9318826CA4fe0402d093b4ca8dB2312014e1C02",
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

test('codeVerification (devnet) should fail - incorrect contract name', () => {
  const body = {
    "chainType": "devnet",
    "contractAddress": "0xb9318826CA4fe0402d093b4ca8dB2312014e1C02",
    "compiler": "0.6.2",
    "optimizer": "No",
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

  test('codeVerification (devnet) should fail - incorrect compiler version', () => {
    const body = {
      "chainType": "devnet",
      "contractAddress": "0xb9318826CA4fe0402d093b4ca8dB2312014e1C02",
      "compiler": "0.6.0",
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
      expect(Object.keys(json).length).toEqual(0);
    });
  });

  test('codeVerification (devnet) should fail - incorrect optimizer (Yes)', () => {
    const body = {
      "chainType": "devnet",
      "contractAddress": "0xb9318826CA4fe0402d093b4ca8dB2312014e1C02",
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

  test('codeVerification (devnet) should fail - incorrect optimizerTimes', () => {
    const body = {
      "chainType": "devnet",
      "contractAddress": "0xb9318826CA4fe0402d093b4ca8dB2312014e1C02",
      "compiler": "0.6.2",
      "optimizer": "No",
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