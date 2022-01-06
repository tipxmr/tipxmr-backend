FROM node:lts-alpine3.14

WORKDIR /usr/app
# Bundle app source
COPY . .

RUN npm install && npm cache clean --force
CMD ["npm", "run", "watch"]