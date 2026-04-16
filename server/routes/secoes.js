const express = require('express');
const router = express.Router();
const db = require('../base');
const axios = require('axios');
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
    res.json({ csrfToken: req.csrfToken() });
});

// Rota de health check
router.get('/health', (req, res) => {
    // Verifica se a requisição vem do localhost
    const requestIP = req.ip || req.connection.remoteAddress;
    const isLocalhost = requestIP === '127.0.0.1' || requestIP === '::1' || requestIP.includes('::ffff:127.0.0.1');
    
    // Verifica o header de autenticação
    const authHeader = req.headers['x-health-check-key'];
    const isValidKey = authHeader === process.env.HEALTH_CHECK_KEY;

    if (!isLocalhost || !isValidKey) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    // Retorna apenas o mínimo necessário
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Criar uma nova seção com validação de reCAPTCHA
router.post('/criar-secao', csrfProtection, async (req, res) => {
    const { recaptchaToken, usuario } = req.body;

    // Validação do reCAPTCHA
    if (!recaptchaToken) {
        return res.status(400).json({ error: 'reCAPTCHA token ausente' });
    }

    // Validação do username
    if (!usuario || typeof usuario !== 'string') {
        return res.status(400).json({ error: 'Nome de usuário inválido' });
    }

    const usuarioTrimmed = usuario.trim();
    if (usuarioTrimmed.length < 3 || usuarioTrimmed.length > 100) {
        return res.status(400).json({ error: 'Nome de usuário deve ter entre 3 e 100 caracteres' });
    }

    try {
        // Verificar o token do reCAPTCHA com a API do Google
        const recaptchaResponse = await axios.post(
            'https://www.google.com/recaptcha/api/siteverify',
            null,
            {
                params: {
                    secret: process.env.RECAPTCHA_SECRET_KEY,
                    response: recaptchaToken,
                }
            }
        );

        const { success, score } = recaptchaResponse.data;

        // Para reCAPTCHA v3, você pode verificar o score (0.0 - 1.0)
        // Para reCAPTCHA v2, success é suficiente
        if (!success || (score && score < 0.5)) {
            console.warn('reCAPTCHA validation failed:', { success, score });
            return res.status(403).json({ error: 'Validação de reCAPTCHA falhou' });
        }

        // Gerar ID da seção
        const idSecao = `${Math.random().toString(36).substr(2, 8)}${Math.floor(Math.random() * 100)}`;
        const uniqueLink = `${urlLocal}/secao/${idSecao}`;
        const nome = idSecao;

        // Inserir no banco de dados
        const query = 'INSERT INTO secoes (nome, unique_link) VALUES (?, ?)';
        db.query(query, [nome, uniqueLink], (error, results) => {
            if (error) {
                console.error('Erro ao criar seção:', error);
                return res.status(500).json({ error: 'Erro ao criar seção' });
            }
            res.header("Content-Type", "application/json");
            res.json({ idSecao, url: uniqueLink });
        });

    } catch (error) {
        console.error('Erro ao verificar reCAPTCHA:', error.message);
        
        // Se houver erro na verificação, rejeitamos por segurança
        if (error.response?.status === 400) {
            return res.status(400).json({ error: 'Erro na validação de reCAPTCHA' });
        }
        
        return res.status(500).json({ error: 'Erro ao processar requisição' });
    }
});

// Rota de login com validação de reCAPTCHA
router.post('/login', async (req, res) => {
    const { recaptchaToken, usuario, idSecao } = req.body;

    // Validações básicas
    if (!usuario || typeof usuario !== 'string') {
        return res.status(400).json({ error: 'Usuário inválido' });
    }

    if (!idSecao || typeof idSecao !== 'string') {
        return res.status(400).json({ error: 'Seção inválida' });
    }

    const usuarioTrimmed = usuario.trim();
    if (usuarioTrimmed.length < 3 || usuarioTrimmed.length > 100) {
        return res.status(400).json({ error: 'Usuário deve ter entre 3 e 100 caracteres' });
    }

    try {
        // Validar reCAPTCHA se a chave estiver configurada
        if (process.env.RECAPTCHA_SECRET_KEY && recaptchaToken) {
            const recaptchaResponse = await axios.post(
                'https://www.google.com/recaptcha/api/siteverify',
                null,
                {
                    params: {
                        secret: process.env.RECAPTCHA_SECRET_KEY,
                        response: recaptchaToken,
                    }
                }
            );

            const { success, score } = recaptchaResponse.data;

            if (!success || (score && score < 0.5)) {
                console.warn('reCAPTCHA validation failed for login:', { success, score });
                return res.status(403).json({ error: 'Validação de reCAPTCHA falhou' });
            }
        } else if (process.env.RECAPTCHA_SECRET_KEY && !recaptchaToken) {
            // Se a chave existe mas não recebeu token, rejeita
            return res.status(400).json({ error: 'Token reCAPTCHA ausente' });
        }

        // Verificar se a seção existe
        db.query('SELECT * FROM secoes WHERE nome = ?', [idSecao], (error, results) => {
            if (error) {
                console.error('Erro no banco:', error);
                return res.status(500).json({ error: 'Erro no servidor' });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: 'Seção não encontrada' });
            }
            // Login bem-sucedido
            res.status(200).json({ success: true, message: 'Login realizado com sucesso' });
        });

    } catch (error) {
        console.error('Erro ao fazer login:', error.message);
        
        if (error.response?.status === 400) {
            return res.status(400).json({ error: 'Erro na validação de reCAPTCHA' });
        }
        
        return res.status(500).json({ error: 'Erro ao processar login' });
    }
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