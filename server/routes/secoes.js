const express = require('express');
const router = express.Router();
const db = require('../base');
let secoes = {}; // Armazena informações das seções no servidor
const urlLocal = 'http://localhost:3000';

// Criar uma nova seção
router.post('/criar-secao', (req, res) => {
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
