const secaoRepository = require('../repositories/secaoRepository');
const recaptchaService = require('./recaptchaService');
const MESSAGES = require('../constants/messages');

const urlLocal = process.env.CLIENT_URL || 'http://localhost:3000';

/**
 * Generates a unique section ID
 * @returns {string} Unique section ID
 */
const generateSecaoId = () => {
  return `${Math.random().toString(36).substr(2, 8)}${Math.floor(Math.random() * 100)}`;
};

/**
 * Creates a new section with reCAPTCHA validation
 * @param {Object} data - Section creation data
 * @param {string} data.usuario - Username
 * @param {string} data.recaptchaToken - reCAPTCHA token
 * @returns {Promise<Object>} { success: boolean, idSecao?: string, url?: string, error?: string }
 */
const criarSecao = async (data) => {
  const { usuario, recaptchaToken } = data;

  try {
    // Verify reCAPTCHA token
    const recaptchaResult = await recaptchaService.verifyRecaptchaToken(recaptchaToken);
    if (!recaptchaResult.success) {
      return {
        success: false,
        error: recaptchaResult.error,
        statusCode: 403,
      };
    }

    // Generate section ID and unique link
    const idSecao = generateSecaoId();
    const uniqueLink = `${urlLocal}/secao/${idSecao}`;
    const nome = idSecao;

    // Save to database
    await secaoRepository.createSecao({ nome, uniqueLink });

    return {
      success: true,
      idSecao,
      url: uniqueLink,
    };
  } catch (error) {
    console.error('Erro ao criar seção:', error.message);
    return {
      success: false,
      error: MESSAGES.SECAO_ERROR,
      statusCode: 500,
    };
  }
};

/**
 * Validates user login to a section with reCAPTCHA validation
 * @param {Object} data - Login data
 * @param {string} data.usuario - Username
 * @param {string} data.idSecao - Section ID
 * @param {string} data.recaptchaToken - reCAPTCHA token
 * @returns {Promise<Object>} { success: boolean, message?: string, error?: string, statusCode?: number }
 */
const loginSecao = async (data) => {
  const { usuario, idSecao, recaptchaToken } = data;

  try {
    // Verify reCAPTCHA token if configured
    if (process.env.RECAPTCHA_SECRET_KEY && recaptchaToken) {
      const recaptchaResult = await recaptchaService.verifyRecaptchaToken(recaptchaToken);
      if (!recaptchaResult.success) {
        return {
          success: false,
          error: recaptchaResult.error,
          statusCode: 403,
        };
      }
    }

    // Check if section exists
    const secaoExists = await secaoRepository.secaoExists(idSecao);
    if (!secaoExists) {
      return {
        success: false,
        error: MESSAGES.SECAO_NOT_FOUND,
        statusCode: 404,
      };
    }

    return {
      success: true,
      message: MESSAGES.LOGIN_SUCCESS,
      statusCode: 200,
    };
  } catch (error) {
    console.error('Erro ao fazer login:', error.message);
    return {
      success: false,
      error: MESSAGES.DB_ERROR,
      statusCode: 500,
    };
  }
};

/**
 * Checks if a section is valid
 * @param {string} idSecao - Section ID
 * @returns {Promise<Object>} { valida: boolean, error?: string }
 */
const isSecaoValida = async (idSecao) => {
  try {
    const exists = await secaoRepository.secaoExists(idSecao);
    return {
      valida: exists,
    };
  } catch (error) {
    console.error('Erro ao validar seção:', error.message);
    return {
      valida: false,
      error: MESSAGES.DB_ERROR,
    };
  }
};

module.exports = {
  criarSecao,
  loginSecao,
  isSecaoValida,
  generateSecaoId,
};
