import { asyncHandler } from './helpers';
import { IServices } from '../services/init';
import codeVerication from '../services/codeverification';

export const routes = (app, services: IServices) => {
  app.get(
    '/status',
    asyncHandler(async (req, res) => {
      return res.json('online');
    })
  );

  app.post(
    '/codeVerification',
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
      } = req.body;
      const check = await codeVerication({
        contractAddress,
        compiler,
        optimizer,
        optimizerTimes,
        sourceCode,
        libraries,
        constructorArguments,
        contractName,
        chainType,
      });

      res.status(200).send(check);
    })
  );

  app.get(
    '/fetchContractCode',
    asyncHandler(async (req, res) => {
      const result = await services.database.getContractCode(req.query.contractAddress);

      if (!result) {
        res.status(400).send({ message: 'contract not found' });
      }

      res.status(200).send(result);
    })
  );
};
