# Use a imagem oficial do Node.js
FROM node:18

# Defina o diretório de trabalho no contêiner
WORKDIR /usr/src/app

# Copie os arquivos necessários para o contêiner
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie o restante do código da aplicação
COPY . .

# Exponha a porta em que o servidor será executado
EXPOSE 4000

# Comando para rodar o servidor
CMD ["node", "server.js"]
