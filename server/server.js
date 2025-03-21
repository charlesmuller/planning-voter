require('dotenv').config({ path: '/usr/src/app/.env' });
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const server = http.createServer(app);
const path = require('path');

const CLIENT_URL = process.env.CLIENT_URL;
const API_PORT = process.env.API_PORT || 4000;

const votos = {};
const secoesRoutes = require('./routes/secoes'); // Caminho para o arquivo de rotas
const secoes = {}; // Estrutura para armazenar usuários e votos por seção

const io = socketIo(server, {
    cors: {
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST']
    }
});

const allowedOrigins = [
    'https://planningvoter.kinghost.net',
    'https://www.planningvoter.kinghost.net',
    CLIENT_URL
];

// Configurações de CORS
const corsOptions = {
    origin: (origin, callback) => {
        // Permite requisições sem origem (e.g., ferramentas como Postman)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST'], // Métodos permitidos
    credentials: true // Permitir envio de cookies e cabeçalhos de autenticação
};

// Middleware de CORS com as opções configuradas
app.use(cors(corsOptions));

// Middleware para lidar com cookies
app.use(cookieParser());

// Middleware para tratar JSON no body das requisições
app.use(express.json());

// Define a rota básica do servidor (pode ser útil para verificar se o servidor está funcionando)
app.get('/', (req, res) => {
    res.send('Servidor WebSocket funcionando');
});

app.use(express.json()); // Middleware para tratar JSON no body das requisições

// Registra as rotas de /server/routes/secoes.js
app.use('/api', secoesRoutes);

// Middleware para servir o React
app.use(express.static(path.join(__dirname, 'frontend', 'build')));

// Configuração de erro padrão
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({ error: 'Token CSRF inválido ou ausente' });
    }
    console.error(err);
    res.status(500).send('Erro interno do servidor');
});

io.on('connection', (socket) => {
    // Evento para quando um usuário loga
    socket.on('usuarioLogado', (data) => {
        console.log('****Iniciado evento usuarioLogado****');
        const { usuario, idSecao } = data;

        if (!idSecao) {
            console.warn(`Erro: idSecao é inválido para o usuário ${usuario}`);
            return;
        }

        console.log('----> Usuário conectado: ', usuario, 'na seção: ', idSecao);

        if (!secoes[idSecao]) {
            secoes[idSecao] = { usuarios: [], votos: {} };
        }

        // Verifica se o usuário já está em outra seção e o remove antes de adicionar à nova
        for (const secao in secoes) {
            if (secoes[secao].usuarios.includes(usuario) && secao !== idSecao) {
                console.log(`Usuário ${usuario} estava na seção ${secao}, removendo antes de adicionar à seção ${idSecao}`);
                secoes[secao].usuarios = secoes[secao].usuarios.filter(u => u !== usuario);
                io.to(secao).emit("usuariosLogados", secoes[secao].usuarios); // Atualiza a seção antiga
            }
        }

        // Adiciona o usuário à seção apenas se ainda não estiver nela
        if (!secoes[idSecao].usuarios.includes(usuario)) {
            secoes[idSecao].usuarios.push(usuario);
            console.log(`Adicionou o usuário: ${usuario} à seção: ${idSecao}`);
        }

        console.log(`Usuários na seção ${idSecao}: ${secoes[idSecao].usuarios}`);

        // Adiciona o socket ao "room" da seção correta
        socket.join(idSecao);

        // Emite a atualização apenas para a seção correta
        io.to(idSecao).emit('usuariosLogados', secoes[idSecao].usuarios);

        // Envia os votos apenas para o usuário recém-logado
        socket.emit("atualizarVotos", secoes[idSecao].votos);
        console.log(`Lista de logados na seção ${idSecao}: ${secoes[idSecao].usuarios}`);
        console.log('------fim usuarioLogado------\n');
    });

    // Escuta eventos de voto
    socket.on('voto', (data) => {
        console.log('Iniciado evento voto');

        const { usuario, valor, idSecao } = data;
        console.log('dados recebidos no server -> ', data);

        // Verifica se a seção existe
        if (secoes[idSecao]) {
            secoes[idSecao].votos[usuario] = valor;

            console.log(`Voto do usuário ${usuario} na seção ${idSecao}: ${valor}`);
            io.to(idSecao).emit("atualizarVotos", secoes[idSecao].votos);
            console.log(`Votos atualizados para os usuários na seção ${idSecao}: ${JSON.stringify(secoes[idSecao].votos)}`);
            console.log('------fim voto------\n');
        }
    });

    // Envia os votos existentes quando um novo cliente se conecta
    // socket.emit("atualizarVotos", votos);

    socket.on("pedirVotos", (data) => {
        console.log("Iniciado evento pedirVotos");
        const { usuario, idSecao, votos } = data;


        // Envia os votos de volta para o cliente
        io.to(idSecao).emit("receberVotos", secoes[idSecao].votos);
        console.log("Votos enviados para o cliente (evento pedir votos):", votos);

        // Emite o evento para todos os clientes
        io.to(idSecao).emit("mostrarVotos", secoes[idSecao].votos);
        console.log("Votos enviados para todos os usuários: ", votos);
        console.log('------fim atualizarVotos------\n');
    });

    socket.on("sair", (data) => {
        console.log('Iniciado evento sair');
        console.log('dados recebidos no server -> ', data);
        const { usuario, idSecao } = data;

        if (secoes[idSecao]) {
            // Remove o usuário da seção
            const index = secoes[idSecao].usuarios.indexOf(usuario);
            if (index !== -1) {
                secoes[idSecao].usuarios.splice(index, 1);
            }

            if (secoes[idSecao].votos[usuario]) {
                delete secoes[idSecao].votos[usuario];
                console.log(`Voto do usuário ${usuario} foi removido.`);

            }

            io.to(idSecao).emit("atualizarVotos", secoes[idSecao].votos);
            console.log('emitindo lista de votos atualizados (evento sair)');

        } else {
            console.warn(`Tentativa de acessar uma seção inexistente`);
        }

        // Emite para todos os clientes a lista atualizada de usuários logados
        io.to(idSecao).emit('usuariosLogados', secoes[idSecao].usuarios);
        console.log('------fim sair------\n');

    });

    socket.on("novaRodada", (data) => {
        console.log('Iniciado evento novaRodada');
        const { idSecao, votos } = data;
        console.log('dados recebidos no server -> ', data);

        if (typeof votos === 'object') {
            console.log(`Nova rodada iniciada. Votos resetados. ${JSON.stringify(idSecao)}`);

            // Limpa o conteúdo do objeto votos
            for (const key in votos) {
                console.log(`[dentro do for] Removendo voto do usuário ${key}`);
                delete votos[key];
            }

        }

        if (secoes[idSecao]) {

            console.log(`Nova rodada iniciada. Votos resetados. ${idSecao}`);
            secoes[idSecao].votos = {}; // Reseta os votos da seção

            // Emite para todos os clientes para limpar os estados de seleção
            io.to(idSecao).emit("resetarRodada");
            console.log('emitindo resetarRodada (evento novaRodada)');

            // Atualiza os votos no frontend
            console.log(`dados antes de emitir receberVotos no server ${idSecao}: ${JSON.stringify(secoes[idSecao].votos)}`);
            io.to(idSecao).emit("receberVotos", secoes[idSecao].votos);
            console.log('emitindo receberVotos (evento novaRodada)');
            console.log('------fim novaRodada------\n');
        }
    });

    // Desconexão do usuário
    socket.on("disconnect", () => {
        console.log("Iniciado evento disconnect");

        let usuarioDesconectado = null;
        let secaoDesconectado = null;

        // Procura o usuário em todas as seções
        for (const [idSecao, dadosSecao] of Object.entries(secoes)) {
            const index = dadosSecao.usuarios.indexOf(socket.id);
            if (index !== -1) {
                usuarioDesconectado = dadosSecao.usuarios[index];
                secaoDesconectado = idSecao;
                dadosSecao.usuarios.splice(index, 1); // Remove o usuário da seção
                console.log(`Usuário desconectado: ${usuarioDesconectado} da seção ${secaoDesconectado}`);
                break;
            }
        }

        if (usuarioDesconectado && secaoDesconectado) {
            if (secoes[secaoDesconectado]?.votos[usuarioDesconectado]) {
                delete secoes[secaoDesconectado].votos[usuarioDesconectado];
                console.log(`Voto do usuário ${usuarioDesconectado} foi removido.`);
            }

            // Atualiza apenas a seção correta
            io.to(secaoDesconectado).emit("usuariosLogados", secoes[secaoDesconectado]?.usuarios || []);
        }
        console.log('------fim disconnect------\n');
    });

    console.log('-------fim connection--------\n');
});

// Inicia o servidor na porta especifica conforme env
server.listen(API_PORT, () => {
    console.log('Servidor WebSocket rodando na porta ' + API_PORT);
});
