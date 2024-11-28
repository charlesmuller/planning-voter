const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors'); // Importe o CORS
const app = express();
const server = http.createServer(app);
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
    console.log('Novo usuário conectado');

    // Escuta eventos de voto
    socket.on('voto', (voto) => {
        console.log(`Voto recebido de ${voto.usuario}: ${voto.valor}`);

        // Envia o voto para todos os outros clientes
        socket.broadcast.emit('voto', voto);
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
