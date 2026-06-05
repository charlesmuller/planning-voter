require('dotenv').config({ path: '/usr/src/app/.env' });
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const logger = require('./utils/logger');

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
const jwtService = require('./services/jwtService');

// Estruturas de dados
const secoes = {}; // Armazena usuários e votos por seção
const socketsPorUsuario = new Map(); // socket.id -> { usuario, idSecao }
const desconexoesPendentes = new Map(); // `${usuario}@${idSecao}` -> NodeJS.Timeout
const DISCONNECT_GRACE_MS = 180000; // 3 min — janela para reconexão sem perder voto/posição

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
                logger.warning('Origem bloqueada pelo CORS (socket.io)', { origin });
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

// Extrai metadados úteis do handshake para diagnóstico
const handshakeMeta = (socket) => ({
    socketId: socket.id,
    ip: socket.handshake.address,
    origin: socket.handshake.headers.origin,
    userAgent: socket.handshake.headers['user-agent'],
    transport: socket.conn && socket.conn.transport ? socket.conn.transport.name : undefined,
});

// Middleware de autenticação do Socket.IO (valida JWT antes de aceitar conexão)
io.use((socket, next) => {
    const meta = handshakeMeta(socket);
    const token = socket.handshake.auth && socket.handshake.auth.token;

    if (!token) {
        logger.warning('Conexão socket sem token', meta);
        return next(new Error('auth:missing-token'));
    }

    const { valido, payload, erro } = jwtService.verificarToken(token);
    if (!valido) {
        logger.warning('Conexão socket com token inválido', { ...meta, erro });
        return next(new Error('auth:invalid-token'));
    }

    socket.data = {
        usuario: payload.usuario,
        idSecao: payload.idSecao,
        tipo: payload.tipo,
    };

    logger.debug('Handshake socket OK', { ...meta, usuario: payload.usuario, idSecao: payload.idSecao });
    next();
});

// Log também tentativas que erram no engine.io (antes do middleware)
io.engine.on('connection_error', (err) => {
    logger.warning('engine.io connection_error', {
        code: err.code,
        message: err.message,
        context: err.context,
        req: err.req ? {
            url: err.req.url,
            method: err.req.method,
            origin: err.req.headers && err.req.headers.origin,
            userAgent: err.req.headers && err.req.headers['user-agent'],
        } : undefined,
    });
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
                logger.warning('Origem bloqueada pelo CORS (express)', { origin });
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
            logger.warning('Token CSRF inválido ou ausente', { url: req.originalUrl, method: req.method });
            return res.status(403).json({ error: 'Token CSRF inválido ou ausente' });
        }
        logger.error('Erro no servidor', { url: req.originalUrl, method: req.method, message: err.message, stack: err.stack });
        res.status(500).send('Erro interno do servidor');
    });
};

// Inicializa middleware
configureExpressMiddleware();

// Funções auxiliares para gerenciamento de sessões
const secaoHelpers = {
    criarSecao: (idSecao) => {
        if (!secoes[idSecao]) {
            secoes[idSecao] = {
                usuarios: [],
                votos: {},
                tempoInicio: Date.now(), // Armazena quando a seção foi criada
                revelado: false,
            };
        }
        return secoes[idSecao];
    },

    removerUsuarioDeOutrasSecoes: (usuario, idSecaoAtual) => {
        for (const secao in secoes) {
            if (secao !== idSecaoAtual) {
                const index = secoes[secao].usuarios.findIndex(u => u.nome === usuario);
                if (index !== -1) {
                    secoes[secao].usuarios.splice(index, 1);
                    io.to(secao).emit("usuariosLogados", secoes[secao].usuarios);
                }
            }
        }
    },

    adicionarUsuario: (idSecao, usuario, tipo = 'votante') => {
        // Validar tipo
        if (!['votante', 'observador'].includes(tipo)) {
            tipo = 'votante';
        }
        
        // Verificar se usuário já existe nesta seção
        const existe = secoes[idSecao].usuarios.some(u => u.nome === usuario);
        if (!existe) {
            secoes[idSecao].usuarios.push({ nome: usuario, tipo });
        }
    },

    removerUsuario: (idSecao, usuario) => {
        const index = secoes[idSecao].usuarios.findIndex(u => u.nome === usuario);
        if (index !== -1) {
            secoes[idSecao].usuarios.splice(index, 1);
        }
    },

    limparVotos: (idSecao) => {
        if (secoes[idSecao]) {
            secoes[idSecao].votos = {};
        }
    },

    resetarTimer: (idSecao) => {
        if (secoes[idSecao]) {
            secoes[idSecao].tempoInicio = Date.now();
        }
    }
};

// Retorna a identidade confiável associada ao socket (ou null se não autenticado)
const getIdentidade = (socket) => socketsPorUsuario.get(socket.id) || null;

// Valida que o evento veio de um socket logado e (se informado) bate com a seção
const validarIdentidade = (socket, evento, idSecaoEsperada, usuarioInformado) => {
    const identidade = getIdentidade(socket);

    if (!identidade) {
        logger.warning('Evento recebido de socket não autenticado', {
            evento,
            socketId: socket.id,
            usuarioInformado,
            idSecaoInformada: idSecaoEsperada,
        });
        return null;
    }

    if (idSecaoEsperada && identidade.idSecao !== idSecaoEsperada) {
        logger.warning('Evento com idSecao divergente da sessão do socket', {
            evento,
            socketId: socket.id,
            usuarioReal: identidade.usuario,
            idSecaoReal: identidade.idSecao,
            idSecaoInformada: idSecaoEsperada,
        });
        return null;
    }

    if (usuarioInformado && usuarioInformado !== identidade.usuario) {
        logger.warning('Tentativa de falsificação de identidade detectada', {
            evento,
            socketId: socket.id,
            usuarioReal: identidade.usuario,
            usuarioInformado,
            idSecao: identidade.idSecao,
        });
    }

    return identidade;
};

// Configuração dos eventos do Socket.IO
io.on('connection', (socket) => {
    logger.debug('Socket conectado', { socketId: socket.id });

    // Evento de login do usuário — usa identidade do JWT validado no handshake
    socket.on('usuarioLogado', () => {
        const { usuario, idSecao } = socket.data || {};
        let { tipo } = socket.data || {};

        if (!idSecao || !usuario) {
            logger.warning('usuarioLogado sem identidade no socket.data', { socketId: socket.id });
            return;
        }

        // Validar tipo
        if (!['votante', 'observador'].includes(tipo)) {
            tipo = 'votante';
        }

        secaoHelpers.criarSecao(idSecao);
        secaoHelpers.removerUsuarioDeOutrasSecoes(usuario, idSecao);
        secaoHelpers.adicionarUsuario(idSecao, usuario, tipo);

        // Cancela qualquer remoção pendente (reconexão dentro do grace period)
        const chavePendencia = `${usuario}@${idSecao}`;
        const pendente = desconexoesPendentes.get(chavePendencia);
        if (pendente) {
            clearTimeout(pendente);
            desconexoesPendentes.delete(chavePendencia);
            logger.debug('Reconexão dentro do grace period', { usuario, idSecao });
        }

        socketsPorUsuario.set(socket.id, { usuario, idSecao, tipo });

        socket.join(idSecao);
        io.to(idSecao).emit('usuariosLogados', secoes[idSecao].usuarios);
        socket.emit("atualizarVotos", secoes[idSecao].votos);

        // Se a rodada já está revelada, sincroniza o novo usuário
        if (secoes[idSecao].revelado) {
            socket.emit("mostrarVotos", secoes[idSecao].votos);
        }

        // Envia o tempo inicial da seção para sincronizar o timer
        socket.emit("sincronizarTimer", { tempoInicio: secoes[idSecao].tempoInicio });

        logger.info('Usuário entrou na seção', {
            usuario,
            idSecao,
            socketId: socket.id,
            totalUsuarios: secoes[idSecao].usuarios.length,
        });
    });

    // Evento de voto
    socket.on('voto', ({ usuario, valor, idSecao }) => {
        const identidade = validarIdentidade(socket, 'voto', idSecao, usuario);
        if (!identidade) return;

        if (!secoes[identidade.idSecao]) {
            logger.warning('Voto recebido para seção inexistente', {
                usuario: identidade.usuario,
                valor,
                idSecao: identidade.idSecao,
            });
            return;
        }

        const usuarioObj = secoes[identidade.idSecao].usuarios.find(u => u.nome === identidade.usuario);
        if (usuarioObj && usuarioObj.tipo === 'observador') {
            logger.warning('Observador tentou votar', {
                usuario: identidade.usuario,
                idSecao: identidade.idSecao,
            });
            return;
        }

        secoes[identidade.idSecao].votos[identidade.usuario] = valor;
        io.to(identidade.idSecao).emit("atualizarVotos", secoes[identidade.idSecao].votos);
        logger.info('Voto registrado', {
            usuario: identidade.usuario,
            valor,
            idSecao: identidade.idSecao,
        });
    });

    // Evento para solicitar votos
    socket.on("pedirVotos", ({ idSecao, usuario }) => {
        const identidade = validarIdentidade(socket, 'pedirVotos', idSecao, usuario);
        if (!identidade) return;

        if (secoes[identidade.idSecao]) {
            secoes[identidade.idSecao].revelado = true;
            io.to(identidade.idSecao).emit("receberVotos", secoes[identidade.idSecao].votos);
            io.to(identidade.idSecao).emit("mostrarVotos", secoes[identidade.idSecao].votos);
            logger.info('Votos revelados', {
                idSecao: identidade.idSecao,
                solicitadoPor: identidade.usuario,
                socketId: socket.id,
                totalVotos: Object.keys(secoes[identidade.idSecao].votos).length,
            });
        }
    });

    // Evento de saída do usuário
    socket.on("sair", ({ usuario, idSecao }) => {
        const identidade = validarIdentidade(socket, 'sair', idSecao, usuario);
        if (!identidade) return;

        if (secoes[identidade.idSecao]) {
            secaoHelpers.removerUsuario(identidade.idSecao, identidade.usuario);
            delete secoes[identidade.idSecao].votos[identidade.usuario];
            socketsPorUsuario.delete(socket.id);

            io.to(identidade.idSecao).emit("atualizarVotos", secoes[identidade.idSecao].votos);
            io.to(identidade.idSecao).emit('usuariosLogados', secoes[identidade.idSecao].usuarios);

            logger.info('Usuário saiu da seção', {
                usuario: identidade.usuario,
                idSecao: identidade.idSecao,
                totalUsuarios: secoes[identidade.idSecao].usuarios.length,
            });
        }
    });

    // Evento de nova rodada
    socket.on("novaRodada", ({ idSecao }) => {
        const identidade = validarIdentidade(socket, 'novaRodada', idSecao);
        if (!identidade) return;

        if (secoes[identidade.idSecao]) {
            secaoHelpers.limparVotos(identidade.idSecao);
            secaoHelpers.resetarTimer(identidade.idSecao); // Reseta o timer no servidor
            secoes[identidade.idSecao].revelado = false;

            io.to(identidade.idSecao).emit("resetarRodada");
            io.to(identidade.idSecao).emit("novaRodada"); // Propaga o evento para todos os clientes
            io.to(identidade.idSecao).emit("receberVotos", secoes[identidade.idSecao].votos);
            
            // Envia o novo tempo inicial para todos os usuários
            io.to(identidade.idSecao).emit("sincronizarTimer", { tempoInicio: secoes[identidade.idSecao].tempoInicio });

            logger.info('Nova rodada iniciada', {
                idSecao: identidade.idSecao,
                iniciadaPor: identidade.usuario,
            });
        }
    });

    // Evento de desconexão — agenda remoção com grace period para reconexão (bloqueio de tela, troca de rede)
    socket.on("disconnect", (reason) => {
        const identidade = socketsPorUsuario.get(socket.id);

        if (!identidade) {
            logger.debug('Socket desconectado sem login prévio', { socketId: socket.id, reason });
            return;
        }

        const { usuario, idSecao } = identidade;
        socketsPorUsuario.delete(socket.id);

        const chavePendencia = `${usuario}@${idSecao}`;

        // Cancela timer anterior, se houver (proteção contra timers órfãos)
        const anterior = desconexoesPendentes.get(chavePendencia);
        if (anterior) clearTimeout(anterior);

        const timer = setTimeout(() => {
            desconexoesPendentes.delete(chavePendencia);

            // Só remove se o usuário ainda não reconectou em outro socket
            const aindaConectado = Array.from(socketsPorUsuario.values()).some(
                (i) => i.usuario === usuario && i.idSecao === idSecao
            );
            if (aindaConectado) {
                logger.debug('Reconectou antes do timeout — pulando remoção', { usuario, idSecao });
                return;
            }

            if (secoes[idSecao]) {
                secaoHelpers.removerUsuario(idSecao, usuario);
                delete secoes[idSecao].votos[usuario];
                io.to(idSecao).emit("usuariosLogados", secoes[idSecao].usuarios);
                io.to(idSecao).emit("atualizarVotos", secoes[idSecao].votos);
            }

            logger.info('Usuário removido após grace period', { usuario, idSecao });
        }, DISCONNECT_GRACE_MS);

        desconexoesPendentes.set(chavePendencia, timer);

        logger.info('Usuário desconectado (aguardando reconexão)', {
            usuario,
            idSecao,
            socketId: socket.id,
            reason,
            graceMs: DISCONNECT_GRACE_MS,
        });
    });
});

// Inicialização do servidor
server.listen(CONFIG.API_PORT, () => {
    logger.info('Servidor WebSocket iniciado', { porta: CONFIG.API_PORT });
});

// Captura erros não tratados
process.on('uncaughtException', (err) => {
    logger.error('uncaughtException', err);
});

process.on('unhandledRejection', (reason) => {
    logger.error('unhandledRejection', reason instanceof Error ? reason : { reason });
});
