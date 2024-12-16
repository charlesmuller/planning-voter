const express = require('express');
const router = express.Router();
const db = require('../base');
const urlLocal = process.env.CLIENT_URL || 'http://localhost:3000';
const cookieParser = require('cookie-parser');
const csrf = require('csurf');

const csrfProtection = csrf({
    cookie: {
      httpOnly: true, // Protege contra acesso via JavaScript
      secure: false,  // Altere para true se usar HTTPS
      sameSite: 'strict', // Controla o envio de cookies entre sites
    },
  });
router.use(cookieParser());

// Criar uma nova seção
router.post('/criar-secao', csrfProtection, (req, res) => {
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

router.get('/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});


module.exports = router;