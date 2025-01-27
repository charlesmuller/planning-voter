const express = require('express');
const router = express.Router();
const db = require('../base');
const urlLocal = process.env.CLIENT_URL || 'http://localhost:3000';
const cookieParser = require('cookie-parser');
const csrf = require('csurf');

router.use(cookieParser());

// Definir csrfProtection após cookieParser
const csrfProtection = csrf({
    cookie: {
        httpOnly: true, // Protege contra acesso via JavaScript
        secure: process.env.NODE_ENV === 'production', // Apenas em produção
        sameSite: 'strict', // Controla o envio de cookies entre sites
        path: '/',
        maxAge: 3600000,
        domain: process.env.COOKIE_DOMAIN || undefined,
    },
});


router.use((req, res, next) => {
    res.set({
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
    });
    next();
});

router.get('/csrf-token', csrfProtection, (req, res) => {
    console.log("CSRF Middleware aplicado"); // Verificar se o middleware está sendo executado
    res.json({ csrfToken: req.csrfToken() });
});

// Criar uma nova seção
router.post('/criar-secao', csrfProtection, (req, res) => {
    console.log('Token CSRF recebido:', req.headers['x-csrf-token']);
    console.log('Corpo da requisição:', req.body);

    const idSecao = `${Math.random().toString(36).substr(2, 8)}${Math.floor(Math.random() * 100)}`;
    const uniqueLink = `${urlLocal}/secao/${idSecao}`;
    const nome = idSecao;
    const query = 'INSERT INTO secoes (nome, unique_link) VALUES (?, ?)';

    db.query(query, [nome, uniqueLink], (error, results) => {
        if (error) {
            console.error('Erro ao criar seção:', error);
            return res.status(500).json({ error: 'Erro ao criar seção' });
        }
        res.header("Content-Type", "application/json");
        res.json({ idSecao, url: uniqueLink });
    });
});

router.get('/secao/:idSecao', (req, res) => {
    const { idSecao } = req.params;

    db.query('SELECT * FROM secoes WHERE nome = ?', [idSecao], (error, results) => {
        if (error) {
            console.error('Erro no banco:', error);
            return res.status(500).json({ valida: false, error: 'Erro no servidor' });
        }
        if (results.length === 0) {
            return res.status(404).json({ valida: false });
        }
        res.json({ valida: true });
    });
});



module.exports = router;