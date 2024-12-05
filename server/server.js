const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const usuariosLogados = [];
const votos = {};

const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

// Use o CORS no Express
app.use(cors());

// Define a rota básica do servidor (pode ser útil para verificar se o servidor está funcionando)
app.get('/', (req, res) => {
    res.send('Servidor WebSocket funcionando');
});

// Escutando novas conexões
io.on('connection', (socket) => {
    console.log('Novo usuário conectado');
    console.log('----------------');


    // Evento para quando um usuário loga
    socket.on('usuarioLogado', (data) => {
        const { usuario } = data;

        console.log('Usuário conectado: ', usuario);
        console.log('----------------');
        // Verifica se o usuário já está na lista para evitar duplicações
        if (!usuariosLogados.includes(usuario)) {
            usuariosLogados.push(usuario);
        }

        console.log(`Usuários logados: ${usuariosLogados}`);
        console.log('----------------');

        // Emite para todos os clientes a lista atualizada
        io.emit('usuariosLogados', usuariosLogados);
        console.log(`Lista de logados: ${usuariosLogados} `);
        console.log('----------------');

        // Emite para o usuário logado os votos atualizados
        socket.emit("atualizarVotos", votos);
        console.log(`Votos atualizados para os usuários logados (evento usuarioLogado): ${usuario}: ${JSON.stringify(votos)}`);
        console.log('----------------');
    });

    // Escuta eventos de voto
    socket.on('voto', (voto) => {
        // Atualiza o voto do usuário
        votos[voto.usuario] = voto.valor;
        console.log(`Voto recebido: ${JSON.stringify(voto)}`);
        console.log('----------------');

        // Emite os votos atualizados para todos os clientes
        io.emit("atualizarVotos", votos);
        console.log(`Votos atualizados (evento voto): ${JSON.stringify(votos)}`);
        console.log('----------------');
    });

    // Envia os votos existentes quando um novo cliente se conecta
    socket.emit("atualizarVotos", votos);

    socket.on("pedirVotos", () => {
        console.log("Evento 'pedirVotos' recebido do cliente");
        console.log('----------------');

        // Envia os votos de volta para o cliente
        io.emit("receberVotos", votos);
        console.log("Votos enviados para o cliente (evento pedir votos):", votos);
        console.log('----------------');

        // Emite o evento para todos os clientes
        io.emit("mostrarVotos", votos);
        console.log("Votos enviados para todos os usuários: ", votos);
        console.log('----------------');
    });

    socket.on("sair", (data) => {
        const { usuario } = data;

        // Remove o usuário da lista de logados
        const index = usuariosLogados.indexOf(usuario);
        if (index !== -1) {
            // Remove o usuário da lista
            usuariosLogados.splice(index, 1);
            console.log(`Usuário ${usuario} saiu.`);
            console.log('----------------');
        }

        // Remove o voto do usuário que saiu
        if (votos[usuario]) {
            delete votos[usuario]; // Remove o voto do usuário
            console.log(`Voto do usuário ${usuario} foi removido.`);
            console.log('----------------');
        }

        console.log(`Usuário ${usuario} saiu. Lista de logados: ${usuariosLogados}`);
        console.log('----------------');

        // Emite para todos os clientes a lista atualizada de usuários logados
        io.emit("usuariosLogados", usuariosLogados);
        console.log('emitindo lista de usuários logados (evento sair)');
        console.log('----------------');
        // Emite para todos os clientes a lista atualizada de votos
        io.emit("atualizarVotos", votos)
        console.log('emitindo lista de votos atualizados (evento sair)');
        console.log('----------------');
    });

    socket.on("novaRodada", () => {
        // Limpa o conteúdo do objeto votos
        for (const key in votos) {
            delete votos[key];
        }

        console.log("Nova rodada iniciada. Votos resetados.");

        // Emite para todos os clientes para limpar os estados de seleção
        io.emit("resetarRodada");

        // Atualiza os votos no frontend
        io.emit("receberVotos", votos);
    });

    // Desconexão do usuário
    socket.on("disconnect", () => {
        console.log("Usuário desconectado (evento disconnect)");
        console.log('----------------');
        // Encontre o usuário desconectado baseado no socket.id
        const usuarioDesconectado = Object.keys(votos).find(
            (user) => votos[user]?.socketId === socket.id
        );

        if (usuarioDesconectado) {
            // Remove votos do usuário
            delete votos[usuarioDesconectado];
            console.log(`Voto do usuário ${usuarioDesconectado} foi removido.`);
            console.log('----------------');
        }

        // Remover o usuário da lista de logados
        const index = usuariosLogados.indexOf(usuarioDesconectado);
        if (index !== -1) {
            // Remove o usuário desconectado
            usuariosLogados.splice(index, 1);
        }

        console.log(`Usuários logados: ${usuariosLogados}`);
        console.log('----------------');

        // Atualiza a lista de usuários logados
        io.emit("usuariosLogados", usuariosLogados);
        console.log('Atualizando lista de usuários logados (evento disconnect)');
    });

});

// Objeto para armazenar as seções e usuários associados
const secoes = {};

// Rota para gerar um link de seção
app.post('/gerar-secao', (req, res) => {
    const { usuario } = req.body;
    const idSecao = `${Math.random().toString(36).substring(2, 10)}-${Date.now()}`;
    
    // Adiciona a seção no objeto com o criador como primeiro usuário
    secoes[idSecao] = { usuarios: [usuario] };
    console.log(`Seção criada: ${idSecao} pelo usuário ${usuario}`);
    
    res.json({ url: `http://localhost:3000/secao/${idSecao}` });
});

// Middleware para validar o acesso a uma seção
io.use((socket, next) => {
    const { idSecao, usuario } = socket.handshake.query;
    if (!secoes[idSecao]) {
        return next(new Error("Seção não encontrada!"));
    }

    // Adiciona o usuário à seção
    if (!secoes[idSecao].usuarios.includes(usuario)) {
        secoes[idSecao].usuarios.push(usuario);
    }
    console.log(`Usuário ${usuario} entrou na seção ${idSecao}`);
    socket.join(idSecao);
    next();
});

// Evento para enviar os usuários de uma seção
io.on('connection', (socket) => {
    const { idSecao } = socket.handshake.query;

    socket.on('usuariosSecao', () => {
        io.to(idSecao).emit('usuariosSecaoAtualizados', secoes[idSecao].usuarios);
    });

    // Remover o usuário ao desconectar
    socket.on('disconnect', () => {
        const { idSecao, usuario } = socket.handshake.query;
        secoes[idSecao].usuarios = secoes[idSecao].usuarios.filter((u) => u !== usuario);
        io.to(idSecao).emit('usuariosSecaoAtualizados', secoes[idSecao].usuarios);
    });
});


// Inicia o servidor na porta 4000
server.listen(4000, () => {
    console.log('Servidor WebSocket rodando na porta 4000');
});
