FROM node:lts-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
COPY .env.production .env
EXPOSE 3000
CMD ["npm", "start"]