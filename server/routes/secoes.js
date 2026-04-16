const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const csrf = require('csurf');

// Import controllers
const {
  criarSecaoController,
  loginController,
  validarSecaoController,
  getCsrfTokenController,
  healthCheckController,
} = require('../controllers/secaoController');

// Import middleware
const setSecurityHeaders = require('../middleware/securityHeaders');

router.use(cookieParser());

// Configure CSRF protection
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 3600000,
    domain: process.env.COOKIE_DOMAIN || undefined,
  },
});

// Apply security headers to all routes
router.use(setSecurityHeaders);

// Routes
router.get('/csrf-token', csrfProtection, getCsrfTokenController);
router.get('/health', healthCheckController);
router.post('/criar-secao', csrfProtection, criarSecaoController);
router.post('/login', loginController);
router.get('/secao/:idSecao', validarSecaoController);

module.exports = router;