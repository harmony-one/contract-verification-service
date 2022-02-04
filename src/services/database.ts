import admin from 'firebase-admin';

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

  public async getContractCode(contractAddress): Promise<any> {
    const data = await this.smartContracts.doc(contractAddress).get();
    return data.data();
  }

  public async getContractSupportingFiles(contractAddress): Promise<any> {
    const data = await this.smartContractFiles.doc(contractAddress).get();
    return data.data();
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
    await this.smartContracts.doc(contractAddress).set({
      contractAddress,
      sourceCode,
      compiler,
      contractName,
      libraries,
      constructorArguments,
      abi,
    });
  }

  public async addContractSupportingFiles({
    contractAddress,
    sources
  }): Promise<void> {
    await this.smartContractFiles.doc(contractAddress).set({
      sources
    })
  }
}

export const databaseService = new DBService();
