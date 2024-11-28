import { io } from 'socket.io-client';

// Crie a conexão com o servidor (substitua pela URL do seu servidor)
const socket = io('http://localhost:3000');

export default socket;
