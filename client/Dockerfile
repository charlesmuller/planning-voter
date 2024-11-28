# Usar uma imagem oficial do Node.js (LTS)
FROM node:lts-alpine

# Defina o diretório de trabalho no contêiner
WORKDIR /app

# Copie os arquivos de dependências para instalar as dependências de forma eficiente
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie o restante do código da aplicação
COPY . .

# Exponha a porta em que a aplicação irá rodar
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "start"]