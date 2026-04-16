const MESSAGES = require('../constants/messages');

/**
 * Validates username input
 * @param {string} usuario - Username to validate
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
 * Validates section ID input
 * @param {string} idSecao - Section ID to validate
 * @returns {Object} { isValid: boolean, error?: string }
 */
const validateIdSecao = (idSecao) => {
  if (!idSecao || typeof idSecao !== 'string') {
    return { isValid: false, error: MESSAGES.SECAO_INVALIDA };
  }

  return { isValid: true, value: idSecao.trim() };
};

/**
 * Validates reCAPTCHA token input
 * @param {string} token - reCAPTCHA token to validate
 * @returns {Object} { isValid: boolean, error?: string }
 */
const validateRecaptchaToken = (token) => {
  if (!token) {
    return { isValid: false, error: MESSAGES.RECAPTCHA_TOKEN_MISSING };
  }

  return { isValid: true, value: token };
};

/**
 * Validates criar-secao request body
 * @param {Object} body - Request body
 * @returns {Object} { isValid: boolean, error?: string, data?: Object }
 */
const validateCreateSecaoRequest = (body) => {
  const { recaptchaToken, usuario } = body;

  // Validate token
  const tokenValidation = validateRecaptchaToken(recaptchaToken);
  if (!tokenValidation.isValid) {
    return { isValid: false, error: tokenValidation.error };
  }

  // Validate usuario
  const usuarioValidation = validateUsuario(usuario);
  if (!usuarioValidation.isValid) {
    return { isValid: false, error: usuarioValidation.error };
  }

  return {
    isValid: true,
    data: {
      recaptchaToken: tokenValidation.value,
      usuario: usuarioValidation.value,
    },
  };
};

/**
 * Validates login request body
 * @param {Object} body - Request body
 * @returns {Object} { isValid: boolean, error?: string, data?: Object }
 */
const validateLoginRequest = (body) => {
  const { recaptchaToken, usuario, idSecao } = body;

  // Validate token if configured
  if (process.env.RECAPTCHA_SECRET_KEY && !recaptchaToken) {
    return { isValid: false, error: MESSAGES.IDRECAPTCHA_MISSING };
  }

  // Validate usuario
  const usuarioValidation = validateUsuario(usuario);
  if (!usuarioValidation.isValid) {
    return { isValid: false, error: usuarioValidation.error };
  }

  // Validate idSecao
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
