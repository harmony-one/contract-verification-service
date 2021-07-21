FROM node:12-alpine3.12

RUN apk add git
WORKDIR /app

ENV NODE_ENV mainnet

RUN mkdir -p /app/keys

COPY . /app/
RUN yarn && yarn build

RUN npm config set user 0
RUN npm config set unsafe-perm true

CMD node ./dist/server.js
