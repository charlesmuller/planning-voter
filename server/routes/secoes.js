const express = require('express');
const router = express.Router();

let secoes = {}; // Armazena informações das seções no servidor

// Criar uma nova seção
router.post('/criar-secao', (req, res) => {
    const idSecao = `${Math.random().toString(36).substr(2, 8)}${Math.floor(Math.random() * 100)}`;
    secoes[idSecao] = { usuarios: [] }; // Inicializa a seção
    res.json({ idSecao, url: `/secao/${idSecao}` });
});

// Validar se uma seção existe
router.get('/validar-secao/:idSecao', (req, res) => {
    const { idSecao } = req.params;
    const valida = !!secoes[idSecao];
    res.json({ valida });
});

module.exports = router;
