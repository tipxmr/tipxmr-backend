FROM node:current-alpine
RUN apk add g++ make python

WORKDIR /usr/local/app

COPY package*.json ./
COPY .env.example ./
RUN npm install && npm cache clean --force

COPY ./src ./src