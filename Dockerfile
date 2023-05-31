# Imagem base
FROM node:lts-alpine

# Define o diretório da aplicação
WORKDIR /app

# Copia o package.json e o package-lock.json para o container
COPY package*.json ./

# Instala o pacote react-scripts globalmente
RUN npm install -g react-scripts

# Instala as dependências do projeto dentro do container
RUN npm install

# Copia todos os arquivos para o container
COPY . .

# Referência a porta onde a aplicação irá rodar
EXPOSE 3000

# Inicia a aplicação
CMD ["npm", "start"]

