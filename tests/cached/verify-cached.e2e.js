const fetch = require('node-fetch');
const fs = require('fs');

// unit testing for the cache

test('contract verification - get when not exist, make it exist, then get it again', () => {

  const body = {
    "chainType": "testnet",
    "contractAddress": "0xA5c1B4559353C6aAcdfe5E18697944955Bb2bE9b",
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

  return fetch('http://localhost:8080/fetchContractCode?contractAddress=0xA5c1B4559353C6aAcdfe5E18697944955Bb2bE9b').then(async (result) => {
    let json = await result.json();
    console.log(json.cached); // this could be null 
    // const prev = json.cached.ttl;
    // expect(!json.cached).toEqual(true);
    
    expect(!json.cached || json.cached.cached).toEqual(true);

    const verifyResult = await fetch('http://localhost:8080/codeVerification', payload);
    json = await verifyResult.json();
    expect(json.success).toEqual(true); 

    json = await (await fetch('http://localhost:8080/fetchContractCode?contractAddress=0xA5c1B4559353C6aAcdfe5E18697944955Bb2bE9b')).json();
    // console.log(json);
    expect(json.cached.cached).toEqual(true); // re-cached

    json = await (await fetch('http://localhost:8080/fetchContractCode?contractAddress=0xA5c1B4559353C6aAcdfe5E18697944955Bb2bE9c')).json();
    console.log("Cached", json);
    expect(!json.sourceCode).toEqual(true);

  });
});
