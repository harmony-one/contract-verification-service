FROM vyperlang/vyper:latest

RUN apt-get update && \
apt-get install -y build-essential

ENV NODE_VERSION=14.16.0
RUN apt install -y curl
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
RUN node --version
RUN npm --version
# https://github.com/npm/npm/issues/20861
RUN npm config set unsafe-perm true 
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
