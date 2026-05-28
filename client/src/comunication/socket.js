import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000';

let socketInstance = null;

const criarSocket = (token) => {
    if (socketInstance) {
        try { socketInstance.disconnect(); } catch (e) { /* ignore */ }
        socketInstance = null;
    }

    socketInstance = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        path: '/socket.io',
        autoConnect: true,
        forceNew: true,
        auth: { token },
    });

    return socketInstance;
};

const getSocket = () => socketInstance;

const desconectarSocket = () => {
    if (socketInstance) {
        try { socketInstance.disconnect(); } catch (e) { /* ignore */ }
        socketInstance = null;
    }
};

export { criarSocket, getSocket, desconectarSocket };
export default { criarSocket, getSocket, desconectarSocket };
