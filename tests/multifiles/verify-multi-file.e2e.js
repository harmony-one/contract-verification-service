const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

test('codeVerification - multifile should pass', () => {
  const body = new FormData();
  body.append("chainType", "testnet");
  body.append("contractAddress", "0xfBcbC0D214693CF4400841770c856e95cB793F4E");
  body.append("compiler", "0.6.2");
  body.append("optimizer", "yes");
  body.append("optimizerTimes", "200");
  body.append("language", 0);
  body.append("contractName", "SimpleToken");

  body.append("Address.sol", fs.createReadStream('tests/artifacts/contracts/Address.sol'));
  body.append("Context.sol", fs.createReadStream('tests/artifacts/contracts/Context.sol'));
  body.append("ERC20.sol", fs.createReadStream('tests/artifacts/contracts/ERC20.sol'));
  body.append("IERC20.sol", fs.createReadStream('tests/artifacts/contracts/IERC20.sol'));
  body.append("SafeMath.sol", fs.createReadStream('tests/artifacts/contracts/SafeMath.sol'));
  body.append("SimpleToken.sol", fs.createReadStream('tests/artifacts/contracts/SimpleToken.sol'));

  const payload = {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    redirect: "follow",
    referrerPolicy: "no-referrer",
    "body": body,
  };

  return fetch('http://localhost:8080/codeVerification', payload).then(async (result) => {
    const json = await result.json();
    console.log(json);
    expect(json.success).toEqual(true);

    const source = await fetch('http://localhost:8080/fetchContractCode?contractAddress=0xfBcbC0D214693CF4400841770c856e95cB793F4E&forced=true')
    const res = await source.json();

    expect(res.sourceCode === body.sourceCode).toEqual(true);
  });
});

test('codeVerification - multifile should fail - incorrect bytecode', () => {
  const body = new FormData();
  body.append("chainType", "testnet");
  body.append("contractAddress", "0xfBcbC0D214693CF4400841770c856e95cB793F4E");
  body.append("compiler", "0.6.2");
  body.append("optimizer", "yes");
  body.append("optimizerTimes", "200");
  body.append("language", 0);
  body.append("contractName", "SimpleToken");

  body.append("Address.sol", fs.createReadStream('tests/artifacts/contracts/Address.sol'));
  body.append("Context.sol", fs.createReadStream('tests/artifacts/contracts/Context.sol'));
  body.append("ERC20.sol", fs.createReadStream('tests/artifacts/contracts/ERC20.sol'));
  body.append("IERC20.sol", fs.createReadStream('tests/artifacts/contracts/IERC20.sol'));
  body.append("SafeMath.sol", fs.createReadStream('tests/artifacts/contracts/SafeMath.sol'));
  body.append("SimpleToken.sol", fs.createReadStream('tests/artifacts/incorrect.sol'));

  const payload = {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    redirect: "follow",
    referrerPolicy: "no-referrer",
    "body": body,
  };

  return fetch('http://localhost:8080/codeVerification', payload).then(async (result) => {
    const json = await result.json();
    expect(json.message).toEqual('Compiled bytecode do not match with bytecode from blockchain');
  });
});

test('codeVerification - multifile should fail - incorrect contract name', () => {
  const body = new FormData();
  body.append("chainType", "testnet");
  body.append("contractAddress", "0xfBcbC0D214693CF4400841770c856e95cB793F4E");
  body.append("compiler", "0.6.2");
  body.append("optimizer", "yes");
  body.append("optimizerTimes", "200");
  body.append("language", 0);
  body.append("contractName", "SimpleTokenFailed");

  body.append("Address.sol", fs.createReadStream('tests/artifacts/contracts/Address.sol'));
  body.append("Context.sol", fs.createReadStream('tests/artifacts/contracts/Context.sol'));
  body.append("ERC20.sol", fs.createReadStream('tests/artifacts/contracts/ERC20.sol'));
  body.append("IERC20.sol", fs.createReadStream('tests/artifacts/contracts/IERC20.sol'));
  body.append("SafeMath.sol", fs.createReadStream('tests/artifacts/contracts/SafeMath.sol'));
  body.append("SimpleToken.sol", fs.createReadStream('tests/artifacts/contracts/SimpleToken.sol'));

  const payload = {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    redirect: "follow",
    referrerPolicy: "no-referrer",
    "body": body,
  };

  return fetch('http://localhost:8080/codeVerification', payload).then(async (result) => {
    const json = await result.json();
    expect(json.message.indexOf('ENOENT: no such file or directory, open ') >= 0).toEqual(true);
  });
});

test('codeVerification - multifile should fail - incorrect optimisation', () => {
  const body = new FormData();
  body.append("chainType", "testnet");
  body.append("contractAddress", "0xfBcbC0D214693CF4400841770c856e95cB793F4E");
  body.append("compiler", "0.6.2");
  body.append("optimizer", "no");
  body.append("optimizerTimes", "0");
  body.append("language", 0);
  body.append("contractName", "SimpleToken");

  body.append("Address.sol", fs.createReadStream('tests/artifacts/contracts/Address.sol'));
  body.append("Context.sol", fs.createReadStream('tests/artifacts/contracts/Context.sol'));
  body.append("ERC20.sol", fs.createReadStream('tests/artifacts/contracts/ERC20.sol'));
  body.append("IERC20.sol", fs.createReadStream('tests/artifacts/contracts/IERC20.sol'));
  body.append("SafeMath.sol", fs.createReadStream('tests/artifacts/contracts/SafeMath.sol'));
  body.append("SimpleToken.sol", fs.createReadStream('tests/artifacts/incorrect.sol'));

  const payload = {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    redirect: "follow",
    referrerPolicy: "no-referrer",
    "body": body,
  };

  return fetch('http://localhost:8080/codeVerification', payload).then(async (result) => {
    const json = await result.json();
    expect(json.message).toEqual('Compiled bytecode do not match with bytecode from blockchain');
  });
});

test('codeVerification - multifile should fail - incorrect compiler', () => {
  const body = new FormData();
  body.append("chainType", "testnet");
  body.append("contractAddress", "0xfBcbC0D214693CF4400841770c856e95cB793F4E");
  body.append("compiler", "0.6.0");
  body.append("optimizer", "yes");
  body.append("optimizerTimes", "200");
  body.append("language", 0);
  body.append("contractName", "SimpleToken");

  body.append("Address.sol", fs.createReadStream('tests/artifacts/contracts/Address.sol'));
  body.append("Context.sol", fs.createReadStream('tests/artifacts/contracts/Context.sol'));
  body.append("ERC20.sol", fs.createReadStream('tests/artifacts/contracts/ERC20.sol'));
  body.append("IERC20.sol", fs.createReadStream('tests/artifacts/contracts/IERC20.sol'));
  body.append("SafeMath.sol", fs.createReadStream('tests/artifacts/contracts/SafeMath.sol'));
  body.append("SimpleToken.sol", fs.createReadStream('tests/artifacts/incorrect.sol'));

  const payload = {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    redirect: "follow",
    referrerPolicy: "no-referrer",
    "body": body,
  };

  return fetch('http://localhost:8080/codeVerification', payload).then(async (result) => {
    const json = await result.json();
    expect(Object.keys(json).length).toEqual(0);
  });
});