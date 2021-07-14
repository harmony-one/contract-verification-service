import { asyncHandler } from './helpers';
import { IServices } from '../services/init';

export const routes = (app, services: IServices) => {
  app.get(
    '/registrations',
    asyncHandler(async (req, res) => {
      const page = parseInt(req.query.page, 10) || 0;
      const size = parseInt(req.query.size, 10) || 50;

      const data = await services.subDomainRegistrations.getAllRegistrations({
        ...req.query,
        page,
        size,
      });

      return res.json(data);
    })
  );

  app.get(
    '/one-registrations',
    asyncHandler(async (req, res) => {
      const page = parseInt(req.query.page, 10) || 0;
      const size = parseInt(req.query.size, 10) || 50;

      const data = await services.registrations.getAllRegistrations({
        ...req.query,
        page,
        size,
      });

      return res.json(data);
    })
  );

  app.get(
    '/stats',
    asyncHandler(async (req, res) => {
      const data = await services.subDomainRegistrations.getStats();

      return res.json(data);
    })
  );

  app.get(
    '/one-stats',
    asyncHandler(async (req, res) => {
      const data = await services.registrations.getStats();

      return res.json(data);
    })
  );
};
