FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install -g react-scripts
RUN npm install socket.io-client

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

