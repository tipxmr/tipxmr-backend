FROM node:current-alpine

WORKDIR /usr/app
# Bundle app source
COPY . .

RUN npm install && npm cache clean --force
USER node