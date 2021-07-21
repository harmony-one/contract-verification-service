import { databaseService, DBService } from './database';

export interface IServices {
  database: DBService;
}

export const InitServices = async (): Promise<IServices> => {
  return {
    database: databaseService,
  };
};
