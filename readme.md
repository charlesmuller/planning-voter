# Planning Voter

O **Planning Voter** é uma aplicação desenvolvida para votação em tempo real, utilizando **React** no frontend e **Node.js** no backend. A comunicação entre o frontend e o backend é feita por meio de WebSockets, permitindo uma interação dinâmica entre os usuários. A aplicação também é containerizada utilizando **Docker**, o que facilita a configuração e a execução em diferentes ambientes.

## Tecnologias Utilizadas

- **Frontend**: React
- **Backend**: Node.js com Express e Socket.IO
- **Docker**: Para containerização dos ambientes de desenvolvimento e produção

## Funcionalidades

- **Votação em tempo real**: Usuários podem votar em diferentes opções, e os votos são transmitidos em tempo real para todos os clientes conectados.
- **Interface de usuário dinâmica**: O frontend é atualizado automaticamente conforme os votos são recebidos através de WebSockets.
- **Suporte a múltiplos usuários**: A aplicação pode ser usada por vários usuários simultaneamente, com cada um podendo emitir votos e ver os resultados em tempo real.

## Instalação

### Requisitos

- [Docker](https://www.docker.com/get-started) (para rodar o ambiente de desenvolvimento)
- [Node.js](https://nodejs.org/en/download/) (para rodar o servidor backend localmente, se não usar Docker)

### Passos para executar localmente

1. **Clone o repositório**:
    ```bash
    git clone https://github.com/seu-usuario/planning-voter.git
    cd planning-voter
    ```

2. **Configurar o Docker (caso queira rodar via containers)**:
    Se você não tiver o Docker configurado, crie e rode os containers com os seguintes comandos:

    ```bash
    # Rodar o backend e o frontend com Docker
    docker-compose up --build
    ```

    Isso irá construir e iniciar os containers para o frontend e backend conforme configurado no arquivo `docker-compose.yml`.

3. **Instalar dependências do backend (se for rodar localmente sem Docker)**:
    No diretório `/server`:
    ```bash
    cd server
    npm install
    ```

4. **Instalar dependências do frontend (se for rodar localmente sem Docker)**:
    No diretório `/client`:
    ```bash
    cd client
    npm install
    ```

5. **Rodar o servidor backend**:
    No diretório `/server`:
    ```bash
    npm start
    ```

6. **Rodar o frontend**:
    No diretório `/client`:
    ```bash
    npm start
    ```

    O frontend estará disponível em `http://localhost:3000` e o backend estará rodando na porta `4000`.

## Como Funciona

1. **Frontend (React)**:
   O frontend é uma aplicação React que se comunica com o servidor backend via WebSocket. Ele permite que os usuários vejam os votos em tempo real e interajam com a aplicação.

2. **Backend (Node.js + Express + Socket.IO)**:
   O backend é responsável por gerenciar a lógica de votação e enviar atualizações em tempo real para os clientes conectados. Ele usa **Socket.IO** para comunicação bidirecional em tempo real.

3. **Docker**:
   O Docker é usado para criar containers que tornam a aplicação mais portável e fácil de executar em diferentes ambientes. O arquivo `docker-compose.yml` ajuda a orquestrar o serviço do frontend e do backend.


## Como Usar

1. **Realizar um Voto**:
   - Acesse a interface web da aplicação.
   - Clique no botão para votar em uma das opções.
   - O voto será enviado ao servidor e transmitido em tempo real para todos os usuários conectados.

2. **Visualizar Votos**:
   - A página de votação será atualizada automaticamente à medida que mais votos forem recebidos.

## Contribuindo

Se você deseja contribuir para o projeto, siga estas etapas:

1. Faça um fork do repositório.
2. Crie uma nova branch (`git checkout -b minha-nova-feature`).
3. Faça as alterações necessárias.
4. Commit as mudanças (`git commit -am 'Adicionando nova funcionalidade'`).
5. Envie para o repositório remoto (`git push origin minha-nova-feature`).
6. Abra um pull request.

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.