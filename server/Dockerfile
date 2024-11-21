FROM node:20

WORKDIR /usr/src/flow/server

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000
