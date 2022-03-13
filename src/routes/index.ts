import { asyncHandler } from "./helpers";
import { IServices } from "../services/init";
import codeVerication from "../services/codeverification";
import { getAddress } from "@harmony-js/crypto";
import { getProxyAddress } from "../services/utils";
import { v4 as uuidv4 } from 'uuid';

export const routes = (app, services: IServices) => {
  app.get(
    "/status",
    asyncHandler(async (req, res) => {
      return res.json("online");
    })
  );

  app.post(
    "/codeVerification",
    asyncHandler(async (req, res) => {
      const {
        contractAddress,
        compiler,
        optimizer,
        optimizerTimes,
        sourceCode,
        libraries,
        constructorArguments,
        contractName,
        chainType,
        language,
      } = req.body;

      const verified = await codeVerication({
        contractAddress,
        compiler,
        optimizer,
        optimizerTimes,
        sourceCode,
        files: req.files,
        libraries,
        constructorArguments,
        contractName,
        chainType,
        language: +language,
      });

      res.status(200).send({ success: verified });
    })
  );

  app.get(
    "/verify",
    asyncHandler(async (req, res) => {
      // get verification status by guid
      const body = req.query;
      const { guid } = body;

      if (!guid) {
        res.json({ message: "Invalid json" });
        return;
      }

      const doc = await services.database.getContractVerificationStatus(guid);

      if (doc?.result === "Pending in queue") {
        res.json({
          doc: doc,
          status: 1,
          ok: 1,
          message: "Pending in queue",
          result: "Pending in queue"
        });
        return;
      }

      const result = {
        doc: doc,
        status: doc?.result ? 1 : 0,
        ok: doc?.result ? 1 : 0,
        message: doc?.result ? "Pass - Verified" : "Fail - Unable to verify",
        result: doc?.result ? "Pass - Verified" : "Fail - Unable to verify"
      }
      res.json(result);
    })
  )

  app.post(
    "/verify",
    asyncHandler(async (req, res) => {
      // verify source code through etherscan-like api
      let data;
      const guid = uuidv4();
      let responseSent = false;

      console.log(req.query);

      try {
        const body = req.body;
        // mapping from harmony to etherscan
        const libraries = [];

        for (let i = 1; i < 11; ++i) {
          if (body[`libraryname${i}`]) {
            libraries.push(body[`libraryname${i}`]);
          }
        }

        let contractName = body.contractname;

        if (contractName.indexOf(":") >= 0) {
          contractName = contractName.substring(contractName.indexOf(":") + 1);
        }

        let source = body.sourceCode;
        let optimizer = body.optimizationUsed === 0 ? "No" : "Yes";
        let optimizerTimes = body.runs;
        let settings = {};

        try {
          const config = JSON.parse(body.sourceCode);
          source = config.sources;
          optimizer = config.settings.optimizer.enabled;
          optimizerTimes = config.settings.optimizer.runs;
          settings = JSON.stringify(config.settings);
          
        }
        catch (e) {
          // do nothing;
        }

        data = {
          contractAddress: body.contractaddress,   //Contract Address starts with 0x...     
          sourceCode: source,             //Contract Source Code (Flattened if necessary)
          contractName: contractName,         //ContractName (if codeformat=solidity-standard-json-input, then enter contractname as ex: erc20.sol:erc20)
          compiler: body.compilerversion,          // see https://etherscan.io/solcversions for list of support versions
          optimizer: optimizer, //0 = No Optimization, 1 = Optimization used (applicable when codeformat=solidity-single-file)
          optimizerTimes: optimizerTimes,                            //set to 200 as default unless otherwise  (applicable when codeformat=solidity-single-file)        
          constructorArguments: body.constructorArguements,     //if applicable
          chainType: req.query?.network || "mainnet",
          settings
        }

        // status of etherscan api has following:
        // return this.message === "Pending in queue";
        // return this.message === "Fail - Unable to verify";
        // return this.message === "Pass - Verified";
        // return this.message.startsWith("Unable to locate ContractCode at");

        // return result
        
        // finish services - consider moving this to a different service if we want
        // async + polling (as with etherscan)
        await services.database.addContractVerificationStatus({
          data,
          guid,
          result: "Pending in queue"
        });
        res.json({ status: 1, message: "Pending in queue", result: guid });
        responseSent = true;
        console.log("Verifying contract", contractName, data.contractAddress, " through etherscan api");
        const verified = await codeVerication(data);

        await services.database.updateContractVerificationStatus({
            data,
            guid,
            result: verified
          });
      }
      catch (e) {
        console.log("Error processing contract", e);
        // res.status(503).json({"error": e});
        if (!responseSent) {
          res.status(503).json({ status: 1, result: "Fail - Unable to verify", error: e });
        }
        await services.database.updateContractVerificationStatus({
          data,
          guid,
          result: 0
        });
      }
    })
  )

  app.get(
    "/fetchContractCode",
    asyncHandler(async (req, res) => {
      const contractAddress = getAddress(
        req.query.contractAddress
      ).checksum.toLowerCase();

      const result = await services.database.getContractCode(contractAddress);

      if (result) {
        const fileObj = await services.database.getContractSupportingFiles(contractAddress);
        result.supporting = fileObj;
        try {
          const proxy = await getProxyAddress(contractAddress, req.query.chainType);
          console.log("PROXY is", proxy, contractAddress);
          result.proxyAddress = proxy?.implementationAddress;
          result.proxyDetails = proxy;
          if (proxy && proxy?.implementationAddress !== "") {
            result.proxy = await services.database.getContractCode(proxy?.implementationAddress.toLocaleLowerCase());
          }
        }
        catch (e) {
          // no proxy address
          console.log("No proxy", e);
        }
      }

      if (!result) {
        res.status(400).send({ message: "contract not found" });
        return;
      }

      res.status(200).send(result);
    })
  );
};
