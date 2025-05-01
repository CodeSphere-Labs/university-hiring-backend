FROM node:slim

WORKDIR /app

RUN apt-get update -y \
&& apt-get install -y openssl

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

CMD ["sh", "-c", "yarn db:deploy && yarn db:seed && yarn build && yarn start:prod"]
