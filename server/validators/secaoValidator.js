const MESSAGES = require('../constants/messages');

/**
 * Valida o nome de usuário
 * @param {string} usuario - Nome de usuário a validar
 * @returns {Object} { isValid: boolean, error?: string }
 */
const validateUsuario = (usuario) => {
  if (!usuario || typeof usuario !== 'string') {
    return { isValid: false, error: MESSAGES.USUARIO_INVALIDO };
  }

  const usuarioTrimmed = usuario.trim();
  if (usuarioTrimmed.length < 3 || usuarioTrimmed.length > 100) {
    return { isValid: false, error: MESSAGES.USUARIO_LENGTH };
  }

  return { isValid: true, value: usuarioTrimmed };
};

/**
 * Valida o ID da seção
 * @param {string} idSecao - ID da seção a validar
 * @returns {Object} { isValid: boolean, error?: string }
 */
const validateIdSecao = (idSecao) => {
  if (!idSecao || typeof idSecao !== 'string') {
    return { isValid: false, error: MESSAGES.SECAO_INVALIDA };
  }

  return { isValid: true, value: idSecao.trim() };
};

/**
 * Valida o token reCAPTCHA
 * @param {string} token - Token reCAPTCHA a validar
 * @returns {Object} { isValid: boolean, error?: string }
 */
const validateRecaptchaToken = (token) => {
  if (!token) {
    return { isValid: false, error: MESSAGES.RECAPTCHA_TOKEN_MISSING };
  }

  return { isValid: true, value: token };
};

/**
 * Valida o corpo da requisição de criação de seção
 * @param {Object} body - Corpo da requisição
 * @returns {Object} { isValid: boolean, error?: string, data?: Object }
 */
const validateCreateSecaoRequest = (body) => {
  const { recaptchaToken, usuario, tipo } = body;

  // Validar token somente se o reCAPTCHA estiver configurado
  let tokenValue = recaptchaToken;
  if (process.env.RECAPTCHA_SECRET_KEY) {
    const tokenValidation = validateRecaptchaToken(recaptchaToken);
    if (!tokenValidation.isValid) {
      return { isValid: false, error: tokenValidation.error };
    }
    tokenValue = tokenValidation.value;
  }

  // Validar usuário
  const usuarioValidation = validateUsuario(usuario);
  if (!usuarioValidation.isValid) {
    return { isValid: false, error: usuarioValidation.error };
  }

  return {
    isValid: true,
    data: {
      recaptchaToken: tokenValue,
      usuario: usuarioValidation.value,
      tipo: ['votante', 'observador'].includes(tipo) ? tipo : 'votante',
    },
  };
};

/**
 * Valida o corpo da requisição de login
 * @param {Object} body - Corpo da requisição
 * @returns {Object} { isValid: boolean, error?: string, data?: Object }
 */
const validateLoginRequest = (body) => {
  const { recaptchaToken, usuario, idSecao, tipo } = body;

  // Validar token se o reCAPTCHA estiver configurado
  if (process.env.RECAPTCHA_SECRET_KEY && !recaptchaToken) {
    return { isValid: false, error: MESSAGES.IDRECAPTCHA_MISSING };
  }

  // Validar usuário
  const usuarioValidation = validateUsuario(usuario);
  if (!usuarioValidation.isValid) {
    return { isValid: false, error: usuarioValidation.error };
  }

  // Validar idSecao
  const idSecaoValidation = validateIdSecao(idSecao);
  if (!idSecaoValidation.isValid) {
    return { isValid: false, error: idSecaoValidation.error };
  }

  return {
    isValid: true,
    data: {
      recaptchaToken,
      usuario: usuarioValidation.value,
      idSecao: idSecaoValidation.value,
      tipo: ['votante', 'observador'].includes(tipo) ? tipo : 'votante',
    },
  };
};

module.exports = {
  validateUsuario,
  validateIdSecao,
  validateRecaptchaToken,
  validateCreateSecaoRequest,
  validateLoginRequest,
};
