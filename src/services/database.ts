import admin from 'firebase-admin';

const DATABASE_URL = process.env.DATABASE_URL;

export class DBService {
  public db: admin.firestore.Firestore;
  private smartContracts;
  private smartContractFiles;

  constructor() {
    // Init admin
    try {
      const serviceAccount = {
        type:process.env.type,
        projectId:process.env.project_id,
        privateKey:process.env.private_key.replace(/\\n/g, '\n'),
        project_id:process.env.project_id,
        private_key_id:process.env.private_key_id.replace(/\\n/g, '\n'),
        private_key:process.env.private_key,
        client_email:process.env.client_email,
        client_id:process.env.client_id,
        auth_uri:process.env.auth_uri,
        token_uri:process.env.token_uri,
        auth_provider_x509_cert_url:process.env.auth_provider_x509_cert_url,
        client_x509_cert_url:process.env.client_x509_cert_url
      };
      //require('../../keys/keys.json');

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: DATABASE_URL,
      });

      this.db = admin.firestore();
      this.db.settings({ ignoreUndefinedProperties: true });

      this.smartContracts = this.db.collection('smartContracts');
      this.smartContractFiles = this.db.collection('smartContractFiles');
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
}

export const databaseService = new DBService();
