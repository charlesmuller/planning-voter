# Usar a imagem oficial do Node.js (versão 18)
FROM node:18

# Defina o diretório de trabalho no contêiner
WORKDIR /usr/src/app

# Copie os arquivos de dependências para instalar as dependências de forma eficiente
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie o restante do código da aplicação
COPY . .

# Copie o arquivo .env.example para .env
COPY .env.example .env

# Exponha a porta em que o servidor irá rodar
EXPOSE 4000

# Comando para rodar o servidor
CMD ["node", "server.js"]