FROM vyperlang/vyper:latest

RUN apt-get update && \
apt-get install -y build-essential

RUN curl -fsSL https://rpm.nodesource.com/setup_14.x | bash -
RUN apt-get update

RUN apt-get install -y nodejs
RUN apt-get install -y npm 
RUN node --version 
RUN npm install -g yarn
WORKDIR /app

ENV NODE_ENV mainnet

RUN mkdir -p /app/keys

COPY . /app/
RUN yarn && yarn build

RUN npm config set user 0
RUN npm config set unsafe-perm true

# RUN npm install -g truffle
RUN yarn global add truffle

RUN pip3 install "vyper==0.2.16"

ENTRYPOINT [ "node", "./dist/server.js" ]
