FROM node:18
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
COPY .env.production .env
EXPOSE 4000
CMD ["node", "server.js"]