const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

console.log(process.env.DB_HOST);  // Verifique se o host está correto
console.log(process.env.DB_USER);  // Verifique se o usuário está correto
console.log(process.env.DB_PASSWORD);  // Verifique se a senha está correta
console.log(process.env.DB_NAME);  // Verifique se o nome do banco de dados está correto


module.exports = db;