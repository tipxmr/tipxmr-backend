FROM node:current-alpine
RUN apk add g++ make python

WORKDIR /usr/local/app

RUN npm install && npm cache clean --force