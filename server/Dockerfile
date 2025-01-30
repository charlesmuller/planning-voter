FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install 
COPY . .
ENV NODE_OPTIONS="--max-old-space-size=768"
COPY .env.production .env
EXPOSE 4000
CMD ["node", "server.js"]
