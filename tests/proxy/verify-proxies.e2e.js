const fetch = require('node-fetch');
const fs = require('fs');

const verifyBox = async (address, box) => {
  const body = {
    "chainType": "testnet",
    "contractAddress": address,
    "compiler": "0.8.2",
    "optimizer": "Yes",
    "language": 0,
    "optimizerTimes": "200",
    "sourceCode": fs.readFileSync("tests/artifacts/proxies/" + box).toString(),
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

  const source = await fetch('http://localhost:8080/fetchContractCode?chainType=testnet&forced=true&contractAddress=' + address)
  const res = await source.json();

  expect(res.sourceCode === body.sourceCode).toEqual(true);
}

test('codeVerification - transparent proxies', () => {
  // 0xd3e4d28eD959c8e55Cf02BD025059Dd66D1fEE81 - testnet
  const body = {
    "chainType": "testnet",
    "contractAddress": "0x2580148A83B8Cd0122CD5EEa96aED3bBC8db3bD3",
    "compiler": "0.8.2",
    "optimizer": "Yes",
    "language": 0,
    "optimizerTimes": "200",
    "sourceCode": fs.readFileSync("tests/artifacts/proxies/TransparentProxy.sol").toString(),
    "contractName": "TransparentUpgradeableProxy",
    "constructorArgs": "0000000000000000000000004311eb946d8818dbb8154d07c398626a7816f28300000000000000000000000044b55329c75f359018c8218baefeb6c4cbbea34a000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000012a00000000000000000000000000000000000000000000000000000000000000",
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

    await verifyBox("0x4311Eb946d8818dBb8154D07c398626a7816f283", "Box.sol");

    const source = await fetch('http://localhost:8080/fetchContractCode?contractAddress=0x2580148A83B8Cd0122CD5EEa96aED3bBC8db3bD3&chainType=testnet&forced=true')
    const res = await source.json();
    expect(json.success).toEqual(true);
    expect(res.sourceCode === body.sourceCode).toEqual(true);
    expect(res.proxyDetails?.isProxy).toEqual(true);
    expect(res.proxyDetails?.implementationAddress).toEqual('0x4311Eb946d8818dBb8154D07c398626a7816f283');
  });
});

// ERC1967Proxy
test('codeVerification - uups proxies', () => {
  // 0xd3e4d28eD959c8e55Cf02BD025059Dd66D1fEE81 - testnet
  const body = {
    "chainType": "testnet",
    "contractAddress": "0xDA98CFb6EFC87ed2Fa87f58a93D2C253356A23dd",
    "compiler": "0.8.2",
    "optimizer": "Yes",
    "language": 0,
    "optimizerTimes": "200",
    "sourceCode": fs.readFileSync("tests/artifacts/proxies/UUPSProxy.sol").toString(),
    "contractName": "ERC1967Proxy",
    "constructorArgs": "360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc416464726573733a206c6f772d6c6576656c2064656c65676174652063616c6c206661696c6564000000000000000000000000699f3bc53f64bd8f256c86a120385900df0f15a300000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000024fe4b84df000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000",
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

    await verifyBox("0x699f3bC53f64BD8F256C86A120385900df0F15a3", "BoxUUPS.sol");

    const source = await fetch('http://localhost:8080/fetchContractCode?contractAddress=0xDA98CFb6EFC87ed2Fa87f58a93D2C253356A23dd&chainType=testnet&forced=true')
    const res = await source.json();
    expect(json.success).toEqual(true);
    expect(res.sourceCode === body.sourceCode).toEqual(true);
    expect(res.proxyDetails?.isProxy).toEqual(true);
    expect(res.proxyDetails?.implementationAddress).toEqual('0x699f3bC53f64BD8F256C86A120385900df0F15a3');
  });
});

test('codeVerification - beacon proxies', () => {
  // 0xD334e113596f50FB9F92c04a5D0c369a702A866C - testnet
  // Box 0xa7c46009a624492ED185A1B4e01DeE5DDd0A6D39
  const body = {
    "chainType": "testnet",
    "contractAddress": "0xa7c46009a624492ED185A1B4e01DeE5DDd0A6D39",
    "compiler": "0.8.2",
    "optimizer": "Yes",
    "language": 0,
    "optimizerTimes": "200",
    "sourceCode": fs.readFileSync("tests/artifacts/proxies/BeaconProxy.sol").toString(),
    "contractName": "BeaconProxy",
    "constructorArgs": "00000000000000000000000098e1487b438823d3e37b0850f0f1b63a03bc8996",
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

    await verifyBox("0x98e1487b438823d3E37B0850f0f1B63a03Bc8996", "BoxBeacon.sol");

    const source = await fetch('http://localhost:8080/fetchContractCode?contractAddress=0xa7c46009a624492ED185A1B4e01DeE5DDd0A6D39&chainType=testnet&forced=true')
    const res = await source.json();
    expect(json.success).toEqual(true);
    expect(res.sourceCode === body.sourceCode).toEqual(true);
    expect(res.proxyDetails?.isBeacon).toEqual(true);
    expect(res.proxyDetails?.implementationAddress).toEqual('0x98e1487b438823d3E37B0850f0f1B63a03Bc8996');
  });
});

