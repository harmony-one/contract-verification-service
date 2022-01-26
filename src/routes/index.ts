import { asyncHandler } from "./helpers";
import { IServices } from "../services/init";
import codeVerication from "../services/codeverification";
import { getAddress } from "@harmony-js/crypto";

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
    "/fetchContractCode",
    asyncHandler(async (req, res) => {
      const contractAddress = getAddress(
        req.query.contractAddress
      ).checksum.toLowerCase();

      const result = await services.database.getContractCode(contractAddress);
      const fileObj = await services.database.getContractSupportingFiles(contractAddress);

      if (!result) {
        res.status(400).send({ message: "contract not found" });
      }
      result.supporting = fileObj;

      res.status(200).send(result);
    })
  );
};
