import { databaseService, DBService } from './database';
import { RegistrationService } from './registrations';
import {
  subDomainEventLogs,
  SubdomainRegisterContractAbi,
  eventLogs,
  RegisterContractAbi,
} from './registrations/helpers';

export interface IServices {
  subDomainRegistrations: RegistrationService;
  registrations: RegistrationService;
  database: DBService;
}

export const InitServices = async (): Promise<IServices> => {
  const subDomainRegistrations = new RegistrationService({
    database: databaseService,
    dbCollectionName: 'subdomain-registrations',
    contractAddress: '0x43B2b112ef03725B5FD42e3ad9b7f2d857ed4642',
    contractAbi: SubdomainRegisterContractAbi,
    eventLogs: subDomainEventLogs,
    eventName: 'NewRegistration',
    lastBlock: 12627019,
    subDomain: true,
  });

  const registrations = new RegistrationService({
    database: databaseService,
    dbCollectionName: 'registrations',
    contractAddress: '0xbed36523Cc78c8093Cd0e4a6730E4c60bDC48B05',
    contractAbi: RegisterContractAbi,
    eventLogs: eventLogs,
    eventName: 'NameRegistered',
    lastBlock: 12627019,
    subDomain: false,
  });

  return {
    subDomainRegistrations,
    registrations,
    database: databaseService,
  };
};
