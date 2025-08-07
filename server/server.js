require('dotenv').config({ path: '/usr/src/app/.env' });
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

// Configurações do ambiente
const CONFIG = {
    CLIENT_URL: process.env.CLIENT_URL,
    API_PORT: process.env.API_PORT || 4000,
    ALLOWED_ORIGINS: [
        'https://planningvoter.kinghost.net',
        'https://www.planningvoter.kinghost.net',
        'http://localhost:3001',
        'http://localhost:3000'
    ]
};

// Importações de rotas
const secoesRoutes = require('./routes/secoes');

// Estruturas de dados
const secoes = {}; // Armazena usuários e votos por seção

// Inicialização do Express
const app = express();
const server = http.createServer(app);

// Configuração do Socket.IO
const io = socketIo(server, {
    cors: {
        origin: (origin, callback) => {
            const origins = [...CONFIG.ALLOWED_ORIGINS];
            if (CONFIG.CLIENT_URL) origins.push(CONFIG.CLIENT_URL);
            
            if (!origin || origins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST'],
        credentials: true
    },
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    allowEIO3: true
});

// Configuração do middleware Express
const configureExpressMiddleware = () => {
    // Configurações de CORS
    const corsOptions = {
        origin: (origin, callback) => {
            const origins = [...CONFIG.ALLOWED_ORIGINS];
            if (CONFIG.CLIENT_URL) origins.push(CONFIG.CLIENT_URL);
            
            if (!origin || origins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST'],
        credentials: true
    };

    app.use(cors(corsOptions));
    app.use(cookieParser());
    app.use(express.json());
    app.use('/api', secoesRoutes);
    app.use(express.static(path.join(__dirname, 'frontend', 'build')));
    
    // Rota de healthcheck
    app.get('/', (req, res) => {
        res.send('Servidor WebSocket funcionando');
    });

    // Tratamento de erros
    app.use((err, req, res, next) => {
        if (err.code === 'EBADCSRFTOKEN') {
            return res.status(403).json({ error: 'Token CSRF inválido ou ausente' });
        }
        console.error('Erro no servidor:', err);
        res.status(500).send('Erro interno do servidor');
    });
};

// Inicializa middleware
configureExpressMiddleware();

// Funções auxiliares para gerenciamento de sessões
const secaoHelpers = {
    criarSecao: (idSecao) => {
        if (!secoes[idSecao]) {
            secoes[idSecao] = { usuarios: [], votos: {} };
        }
        return secoes[idSecao];
    },

    removerUsuarioDeOutrasSecoes: (usuario, idSecaoAtual) => {
        for (const secao in secoes) {
            if (secoes[secao].usuarios.includes(usuario) && secao !== idSecaoAtual) {
                secoes[secao].usuarios = secoes[secao].usuarios.filter(u => u !== usuario);
                io.to(secao).emit("usuariosLogados", secoes[secao].usuarios);
            }
        }
    },

    adicionarUsuario: (idSecao, usuario) => {
        if (!secoes[idSecao].usuarios.includes(usuario)) {
            secoes[idSecao].usuarios.push(usuario);
        }
    },

    removerUsuario: (idSecao, usuario) => {
        const index = secoes[idSecao].usuarios.indexOf(usuario);
        if (index !== -1) {
            secoes[idSecao].usuarios.splice(index, 1);
        }
    },

    limparVotos: (idSecao) => {
        if (secoes[idSecao]) {
            secoes[idSecao].votos = {};
        }
    }
};

// Configuração dos eventos do Socket.IO
io.on('connection', (socket) => {
    // Evento de login do usuário
    socket.on('usuarioLogado', ({ usuario, idSecao }) => {
        if (!idSecao) return;

        secaoHelpers.criarSecao(idSecao);
        secaoHelpers.removerUsuarioDeOutrasSecoes(usuario, idSecao);
        secaoHelpers.adicionarUsuario(idSecao, usuario);
        
        socket.join(idSecao);
        io.to(idSecao).emit('usuariosLogados', secoes[idSecao].usuarios);
        socket.emit("atualizarVotos", secoes[idSecao].votos);
    });

    // Evento de voto
    socket.on('voto', ({ usuario, valor, idSecao }) => {
        if (secoes[idSecao]) {
            secoes[idSecao].votos[usuario] = valor;
            io.to(idSecao).emit("atualizarVotos", secoes[idSecao].votos);
        }
    });

    // Evento para solicitar votos
    socket.on("pedirVotos", ({ idSecao }) => {
        if (secoes[idSecao]) {
            io.to(idSecao).emit("receberVotos", secoes[idSecao].votos);
            io.to(idSecao).emit("mostrarVotos", secoes[idSecao].votos);
        }
    });

    // Evento de saída do usuário
    socket.on("sair", ({ usuario, idSecao }) => {
        if (secoes[idSecao]) {
            secaoHelpers.removerUsuario(idSecao, usuario);
            delete secoes[idSecao].votos[usuario];
            
            io.to(idSecao).emit("atualizarVotos", secoes[idSecao].votos);
            io.to(idSecao).emit('usuariosLogados', secoes[idSecao].usuarios);
        }
    });

    // Evento de nova rodada
    socket.on("novaRodada", ({ idSecao }) => {
        if (secoes[idSecao]) {
            secaoHelpers.limparVotos(idSecao);
            io.to(idSecao).emit("resetarRodada");
            io.to(idSecao).emit("receberVotos", secoes[idSecao].votos);
        }
    });

    // Evento de desconexão
    socket.on("disconnect", () => {
        for (const [idSecao, dadosSecao] of Object.entries(secoes)) {
            const index = dadosSecao.usuarios.indexOf(socket.id);
            if (index !== -1) {
                const usuario = dadosSecao.usuarios[index];
                secaoHelpers.removerUsuario(idSecao, usuario);
                delete secoes[idSecao].votos[usuario];
                io.to(idSecao).emit("usuariosLogados", secoes[idSecao].usuarios);
                break;
            }
        }
    });
});

// Inicialização do servidor
server.listen(CONFIG.API_PORT, () => {
    console.log(`Servidor WebSocket rodando na porta ${CONFIG.API_PORT}`);
});
