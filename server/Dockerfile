FROM node:18

WORKDIR /usr/src/flow-server

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

