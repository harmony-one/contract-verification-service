# contract-verification-service
Verify & Publish Contract Source Code

## Install instructions

### Requirements 

* nodejs 

### Commands

* Fetch repo 

```
https://github.com/harmony-one/contract-verification-service
```

* Install dependencies

```
npm install
```

* Develop

```
npm run build
npm run start:watch
```

* Build

```
npm run build
```

* Start prod

```
npm run start:prod
```

### Cache Configuration
Contract verification service uses the node-cache in-memory cache to manage contract verification and reduce traffic to the servers.  
Note: this is not optimised for load-balanced / distributed services as each service will contain its own verification cache which is cleared if a contract state goes from un-verified to verified. Consider using redis for a distributed caching to support multi-node contract verification.  

The following are the parameters that can be configured:  
1. CACHE_STD_TTL - the max duration that a cached item exists in memory before it is purged (default 86400 seconds - 1 day)
2. CACHE_CHECK_PERIOD - the period for which the cache-checker will periodically check for expired cache items (default 600 seconds - 10 minutes). Increase this to keep cache-misses in memory longer
3. CACHE_MAX_KEYS - the max number of keys that are kept in memory before cache additions begin to be reject (default -1, unlimited keys). Set this value to reduce memory usage  
4. CACHE_MISSED_TTL - the duration of time that a missed cache item (e.g. database returns null) is cached (default 300 seconds). 

Cache - miss (where the contract source code retrieval returns null) are cached in-memory for 5 minutes. When a contract verification is performed and is successfuly, the cache is updated with the verified contract details. This allows the system to cache null values on repeated queries (most contracts are not verified) while still clearing these cache values in the case where the contract verification has occurred.  

Note: Cache are flushed on reset, there is no persistence.

