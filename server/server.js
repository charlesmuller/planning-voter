const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors'); // Importe o CORS
const app = express();
const server = http.createServer(app);
const usuariosLogados = [];
let votos = {}; // Armazena os votos de todos os usuários

const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000', // Permita apenas requisições deste origin
        methods: ['GET', 'POST'], // Métodos HTTP permitidos
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
    console.log('----------------');
    console.log('Novo usuário conectado');


    // Evento para quando um usuário loga
    socket.on('usuarioLogado', (data) => {
        const { usuario } = data;

        console.log('Usuário conectado: ', usuario);


        // Verifica se o usuário já está na lista para evitar duplicações
        if (!usuariosLogados.includes(usuario)) {
            usuariosLogados.push(usuario);
        }

        console.log(`Usuários logados: ${usuariosLogados}`);
        console.log('----------------');
        // Emite para todos os clientes a lista atualizada
        io.emit('usuariosLogados', usuariosLogados);
    });

    // Escuta eventos de voto
    socket.on('voto', (voto) => {
        votos[voto.usuario] = voto.valor; // Atualiza o voto do usuário
        console.log(`Voto recebido: ${JSON.stringify(voto)}`);

        io.emit("voto", voto); // Emite o voto para os usuários
    });

    socket.on("pedirVotos", () => {
        console.log("Evento 'pedirVotos' recebido do cliente"); // Verifique no terminal
        io.emit("receberVotos", votos); // Envia os votos de volta para o cliente
        console.log("Votos enviados para o cliente:", votos);

        // Emite o evento para todos os clientes
        io.emit("mostrarVotos", votos); // Envia os votos para todos
        console.log("Votos enviados para todos os usuários: ", votos);
    });

    socket.on("sair", (data) => {
        const { usuario } = data;
    
        // Remove o usuário da lista de logados
        const index = usuariosLogados.indexOf(usuario);
        if (index !== -1) {
            usuariosLogados.splice(index, 1); // Remove o usuário
        }
    
        console.log(`Usuário ${usuario} saiu. Lista de logados: ${usuariosLogados}`);
    
        // Emite para todos os clientes a lista atualizada de usuários logados
        io.emit("usuariosLogados", usuariosLogados);
    });    

    // Desconexão do usuário
    socket.on('disconnect', () => {
        console.log('Usuário desconectado');
    });
});

// Inicia o servidor na porta 4000
server.listen(4000, () => {
    console.log('Servidor WebSocket rodando na porta 4000');
});
