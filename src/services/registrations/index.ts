import Web3 from 'web3';
import { Harmony } from '@harmony-js/core';
import { Messenger, HttpProvider } from '@harmony-js/network';
import { ChainType, ChainID } from '@harmony-js/utils';
import { hash } from 'eth-ens-namehash';
import moment = require('moment');

import { DBService } from '../database';
import { manualOperations } from './manual_operations';

export interface IRegistrationService {
  database: DBService;
  dbCollectionName: string;
  contractAddress: string;
  contractAbi: any;
  eventLogs: any;
  lastBlock: number;
  eventName: string;
  subDomain: boolean;
}

export interface IRegistration {
  domain: string;
  twitter: string;
  owner: string;
  ownerONE: string;
  price: number;
  expires: string;
  timestamp: number;
  from: string;
}

const sleep = sec => new Promise(res => setTimeout(res, sec * 1000));

export class RegistrationService {
  database: DBService;

  dbCollectionName = 'registrations';

  registrations: IRegistration[] = [];

  lastBlock = 12627019;
  contractAddress = '';

  blocksInterval = Number(process.env.BLOCKS_INTERVAL) || 30000;
  waitInterval = Number(process.env.WAIT_INTERVAL) || 1000;
  cacheLimit = Number(process.env.CACHE_LIMIT) || 10000;
  topicAddress = '';

  contractAbi = [];
  eventLogs = [];
  eventName = '';
  subDomain = false;

  web3: Web3;
  hmy: Harmony;
  contract;

  nodeURL = process.env.NODE_URL || 'https://api.s0.t.hmny.io';

  constructor(params: IRegistrationService) {
    this.database = params.database;

    this.web3 = new Web3(this.nodeURL);

    this.hmy = new Harmony(
      // let's assume we deploy smart contract to this end-point URL
      this.nodeURL,
      {
        chainType: ChainType.Harmony,
        chainId: Number(ChainID.HmyMainnet),
      }
    );

    this.dbCollectionName = params.dbCollectionName;
    this.contractAddress = params.contractAddress;
    this.lastBlock = params.lastBlock;
    this.contractAbi = params.contractAbi;
    this.eventLogs = params.eventLogs;
    this.eventName = params.eventName;
    this.subDomain = params.subDomain;

    this.contract = this.hmy.contracts.createContract(this.contractAbi, this.contractAddress);

    this.topicAddress = this.contract.abiModel.getEvent(this.eventName).signature;

    this.init();
  }

  async init() {
    this.getEvents();
  }

  getEvents = async () => {
    try {
      const latest = await this.web3.eth.getBlockNumber();

      if (latest > this.lastBlock) {
        const logsMessenger = new Messenger(new HttpProvider(this.nodeURL));

        const from = this.lastBlock;
        const to = from + this.blocksInterval > latest ? latest : from + this.blocksInterval;

        const logsRes = await logsMessenger.send('hmy_getLogs', [
          {
            fromBlock: '0x' + from.toString(16),
            toBlock: '0x' + to.toString(16),
            address: this.contractAddress,
            topics: [this.topicAddress],
          },
        ]);

        let logs: IRegistration[] = await Promise.all(
          logsRes.result.map(async log => {
            try {
              const decoded = this.web3.eth.abi.decodeLog(
                this.eventLogs,
                log.data,
                log.topics.slice(1)
              );

              const res = await this.hmy.blockchain.getTransactionByHash({
                txnHash: log.transactionHash,
              });

              let twitter, manualRecord;

              const domainName = decoded.subdomain;

              if (!!this.subDomain) {
                twitter = await this.contract.methods
                  .twitter(hash(`${decoded.subdomain}.crazy.one`))
                  .call({ gasLimit: 6721900, gasPrice: 10000 });

                if (res.result.from === 'one1lhvxtynwpsq3kjexg6qgd06stta8hr4ll95zce') {
                  return null;
                }

                manualRecord = manualOperations.find(a => !!a.status && a.domain === domainName);
              }

              const rec: IRegistration = {
                from: res.result.from,
                timestamp: Number(res.result.timestamp),
                domain: manualRecord ? manualRecord.domainNew : domainName,
                twitter,
                owner: decoded.owner,
                ownerONE: this.hmy.crypto.getAddress(decoded.owner).bech32,
                price: Number(res.result.value) / 1e18,
                expires: new Date(Number(decoded.duration) * 1000).toISOString().split('T')[0],
              };

              return rec;
            } catch (e) {
              console.log(e);
            }
          })
        );

        logs = logs.filter(l => !!l);

        this.registrations = this.registrations.concat(logs);

        this.lastBlock = to;

        // console.log('Last block: ', this.lastBlock);
      } else {
        await sleep(20);
      }
    } catch (e) {
      console.log(e);
    }

    setTimeout(this.getEvents, this.waitInterval);
  };

  restoreOperationsFromDB = async () => {
    this.registrations = await this.database.getCollectionDataWithLimit(
      this.dbCollectionName,
      'timestamp',
      this.cacheLimit
    );
  };

  getStats = () => {
    return {
      totalRegistered: this.registrations.length,
      totalFundsRaised: this.registrations.reduce((acc, log) => acc + Number(log.price), 0),
    };
  };

  getAllRegistrations = (params: { search?: string; size: number; page: number }) => {
    const filteredData = this.registrations.filter(log => {
      if (params.search) {
        if (
          log.domain.includes(params.search) ||
          (log.twitter && log.twitter.includes(params.search))
        )
          return true;

        try {
          const searchAddress = this.hmy.crypto.getAddress(params.search).checksum;

          return (
            this.hmy.crypto.getAddress(log.owner).checksum === searchAddress ||
            this.hmy.crypto.getAddress(log.from).checksum === searchAddress
          );
        } catch (e) {
          // console.log(e);
        }

        return false;
      }

      return true;
    });

    const sortedData = filteredData.sort((a, b) => {
      return moment(a.timestamp * 1000).isBefore(b.timestamp * 1000) ? 1 : -1;
    });

    const from = params.page * params.size;
    const to = (params.page + 1) * params.size;
    const paginationData = sortedData.slice(from, Math.min(to, filteredData.length));

    return {
      content: paginationData,
      totalElements: filteredData.length,
      totalPages: Math.ceil(filteredData.length / params.size),
      size: params.size,
      page: params.page,
    };
  };
}
