import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000';
console.log('Connecting to Socket URL:', SOCKET_URL); // Debug log

const socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    path: '/socket.io', // Explicitamente definindo o path padrão do Socket.IO
    autoConnect: true,
    forceNew: true
});

// Adiciona listeners para debug
socket.on('connect', () => {
    console.log('Socket conectado com sucesso!');
    console.log('ID da conexão:', socket.id);
});

socket.on('connect_error', (error) => {
    console.error('Erro na conexão do Socket:', error);
});

socket.on('disconnect', (reason) => {
    console.log('Socket desconectado:', reason);
});

// Tenta reconectar se houver falha
socket.on('reconnect_attempt', (attemptNumber) => {
    console.log(`Tentativa de reconexão #${attemptNumber}`);
});

export default socket;