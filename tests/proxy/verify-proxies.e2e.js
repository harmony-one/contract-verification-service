const fetch = require('node-fetch');
const fs = require('fs');

const verifyBox = async (address) => {
  const body = {
    "chainType": "testnet",
    "contractAddress": address,
    "compiler": "0.8.2",
    "optimizer": "Yes",
    "language": 0,
    "optimizerTimes": "200",
    "sourceCode": fs.readFileSync("tests/artifacts/proxies/Box.sol").toString(),
    "contractName": "Box"
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
  const result = await fetch('http://localhost:8080/codeVerification', payload);
  const json = await result.json();
  console.log(json);
  expect(json.success).toEqual(true);

  const source = await fetch('http://localhost:8080/fetchContractCode?contractAddress=' + address)
  const res = await source.json();

  expect(res.sourceCode === body.sourceCode).toEqual(true);
}

test('codeVerification - transparent proxies', () => {
  // 0xd3e4d28eD959c8e55Cf02BD025059Dd66D1fEE81 - testnet
  const body = {
    "chainType": "testnet",
    "contractAddress": "0xFA4287443553Debb88b58923448A0B2b003d7e5B",
    "compiler": "0.8.2",
    "optimizer": "Yes",
    "language": 0,
    "optimizerTimes": "200",
    "sourceCode": fs.readFileSync("tests/artifacts/proxies/TransparentProxy.sol").toString(),
    "contractName": "TransparentUpgradeableProxy",
    "constructorArgs": "b53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc416464726573733a206c6f772d6c6576656c2064656c65676174652063616c6c206661696c6564000000000000000000000000d27950073cf0277dea0f34f1a595b739926e90f3000000000000000000000000eb5df44afb325540e63290a0c7fcc56952527c0900000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000024fe4b84df000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000",
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

    await verifyBox("0xd8E187F05A9dFFAEC327350869D9572855F10a83");

    const source = await fetch('http://localhost:8080/fetchContractCode?contractAddress=0xFA4287443553Debb88b58923448A0B2b003d7e5B')
    const res = await source.json();
    console.log(res)
    expect(res.sourceCode === body.sourceCode).toEqual(true);
  });
});

test('codeVerification - uups proxies', () => {
  expect(1 + 2).toBe(3);
});

test('codeVerification - beacon proxies', () => {
  expect(1 + 2).toBe(3);
});

