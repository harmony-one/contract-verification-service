# ethhmy-bridge.appengine
Harmony Eth Bridge appengine

## Install instructions

### Requirements 

* nodejs 

### Commands

* Fetch repo 

```
git clone git@github.com:harmony-one/ethhmy-bridge.appengine.git
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

* How to get all operations list 

```
curl --location --request GET 'http://localhost:8080/busd/operations'
```

# Docker

## build ethhmy-be docker image
```
./build.sh
```

## push to docker hub
You need to have permission to push to the harmonyone repo.

```bash
sudo docker login
sudo docker tag ethhmy-be harmonyone/ethhmy-be:latest
sudo docker push harmonyone/ethhmy-be
```
