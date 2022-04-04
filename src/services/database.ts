import admin from 'firebase-admin';
import NodeCache from "node-cache";

// cache for contract source code
// stdTTL - time that cache is kept alive before flush (default 1 day)
// checkperiod - time that cache removal is applied
// maxKeys - max number of keys stored in cache
const contractCache = new NodeCache({
  stdTTL: +process.env.CACHE_STD_TTL || 86400,
  checkperiod: +process.env.CACHE_CHECK_PERIOD || 600,
  maxKeys: +process.env.CACHE_MAX_KEYS || -1
});

const missedCacheTTL = +process.env.CACHE_MISSED_TTL || 300

const DATABASE_URL = process.env.DATABASE_URL;

export class DBService {
  public db: admin.firestore.Firestore;
  private smartContracts;
  private smartContractFiles;
  private smartContractVerifications;

  constructor() {
    // Init admin
    try {
      const serviceAccount = require('../../keys/keys.json');

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: DATABASE_URL,
      });

      this.db = admin.firestore();
      this.db.settings({ ignoreUndefinedProperties: true });

      this.smartContracts = this.db.collection('smartContracts');
      this.smartContractFiles = this.db.collection('smartContractFiles');
      this.smartContractVerifications = this.db.collection("smartContractVerifications");
    } catch (e) {
      console.error(e);
    }
  }

  public getCollectionData = async (collectionName: string): Promise<any> => {
    const snapshot = await this.db.collection(collectionName).get();
    return snapshot.docs.map(doc => doc.data());
  };

  public updateDocument = async (collectionName: string, docName: string, data) => {
    await this.db.collection(collectionName).doc(docName).set(data);
  };

  public getCollectionDataWithLimit = async (
    collectionName: string,
    orderBy: string,
    limit: number
  ): Promise<any> => {
    try {
      const snapshot = await this.db
        .collection(collectionName)
        .orderBy(orderBy, 'desc')
        .limit(limit)
        .get();
      return snapshot.docs.map(doc => doc.data());
    } catch (err) {
      console.log('getCollectionDataWithLimit: ', err);
      return [];
    }
  };

  public getGlobalDataWithLimit = async (collectionName, orderBy, limit) => {
    try {
      const snapshot = await this.db
        .collection(collectionName)
        .orderBy(orderBy, 'desc')
        .limit(limit)
        .get();
      return snapshot.docs.map(doc => doc.data());
    } catch (err) {
      console.log(`error when get global data ${collectionName}`);
      return [];
    }
  };

  private async getAndCache(contractAddress, key, forced, collection, throws: boolean = true) {
    if (contractCache.has(key) && !forced) { // what if its null?
      const data = contractCache.get<any>(key).result;

      if (!data && throws) {
        throw new Error("Not found");
      }
      return {
        result: data, cached: {
          ttl: contractCache.getTtl(key),
          cached: true,
        }
      };
    }
    try {
      const data = await collection.doc(contractAddress).get();
      contractCache.set(key, { result: data.data() });
      return { result: data.data() };
    } catch (err) {
      // cache miss, store this with a 5 minute ttl
      contractCache.set(key, { result: null }, missedCacheTTL);
      throw err;
    }
  }

  public async getContractCode(contractAddress, forced: boolean): Promise<any> {
    return await this.getAndCache(contractAddress, contractAddress, forced, this.smartContracts);
  }

  public async getContractSupportingFiles(contractAddress, forced: boolean): Promise<any> {
    return await this.getAndCache(contractAddress, contractAddress + ".supporting", forced, this.smartContractFiles, false);
  }

  public async getContractVerificationStatus(guid): Promise<any> {
    const data = await this.smartContractVerifications.doc(guid).get();
    return data.data();
  }

  public async addContractVerificationStatus({
    guid,
    data,
    result
  }): Promise<void> {
    await this.smartContractVerifications.doc(guid).set({
      guid,
      data,
      result
    })
  }

  public async updateContractVerificationStatus({
    guid,
    data,
    result
  }): Promise<void> {
    await this.smartContractVerifications.doc(guid).set({
      guid,
      data,
      result
    })
  }

  public async addContractCode({
    contractAddress,
    sourceCode,
    compiler,
    contractName,
    constructorArguments,
    libraries,
    abi,
  }): Promise<void> {
    const doc = {
      contractAddress,
      sourceCode,
      compiler,
      contractName,
      libraries,
      constructorArguments,
      abi,
    };
    await this.smartContracts.doc(contractAddress).set(doc);
    contractCache.set(contractAddress, { result: doc });
  }

  public async addContractSupportingFiles({
    contractAddress,
    sources
  }): Promise<void> {
    await this.smartContractFiles.doc(contractAddress).set({
      sources
    })
    contractCache.set(contractAddress + ".supporting", { result: sources });
  }
}

export const databaseService = new DBService();
