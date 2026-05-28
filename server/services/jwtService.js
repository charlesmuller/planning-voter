const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-CHANGE-IN-PROD';
const JWT_EXPIRES_IN = '1h';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  // eslint-disable-next-line no-console
  console.error('JWT_SECRET não configurado em produção. Abortando.');
  process.exit(1);
}

const gerarToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const verificarToken = (token) => {
  try {
    return { valido: true, payload: jwt.verify(token, JWT_SECRET) };
  } catch (err) {
    return { valido: false, erro: err.message };
  }
};

module.exports = { gerarToken, verificarToken };
