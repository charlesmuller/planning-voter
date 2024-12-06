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
        res.json({ idSecao, url: uniqueLink });
    });
});

// Validar se uma seção existe
router.get('/validar-secao/:idSecao', (req, res) => {
    const { idSecao } = req.params;
    const query = 'SELECT * FROM secoes WHERE unique_link = ?';

    db.query(query, [`/secao/${idSecao}`], (error, results) => {
        if (error) {
            console.error('Erro ao validar seção:', error);
            return res.status(500).json({ error: 'Erro ao validar seção' });
        }
        if (results.length > 0) {
            return res.json({ valida: true, secao: results[0] });  // Retorna a seção encontrada
        }
        res.json({ valida: false });
    });
});



module.exports = router;