# Imagem base
FROM nginx:alpine

# Copia o arquivo de configuração do Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copia os arquivos da aplicação React
COPY build /usr/share/nginx/html

# Define a porta do serviço
EXPOSE 80

# Inicia o serviço Nginx
CMD ["nginx", "-g", "daemon off;"]
