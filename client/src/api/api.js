import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:4000/api', // URL base do seu backend
    withCredentials: true, // Garante que cookies e credenciais sejam enviados
});

export default api;
