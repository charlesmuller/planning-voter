const secaoRepository = require('../repositories/secaoRepository');
const recaptchaService = require('./recaptchaService');
const MESSAGES = require('../constants/messages');

const urlLocal = process.env.CLIENT_URL || 'http://localhost:3000';

/**
 * Gera um ID único para a seção
 * @returns {string} ID da seção
 */
const generateSecaoId = () => {
  return `${Math.random().toString(36).substr(2, 8)}${Math.floor(Math.random() * 100)}`;
};

/**
 * Cria uma nova seção com validação reCAPTCHA
 * @param {Object} data - Dados de criação da seção
 * @param {string} data.usuario - Nome do usuário
 * @param {string} data.recaptchaToken - Token do reCAPTCHA
 * @returns {Promise<Object>} { success: boolean, idSecao?: string, url?: string, error?: string }
 */
const criarSecao = async (data) => {
  const { usuario, recaptchaToken } = data;

  try {
    // Verificar token reCAPTCHA somente se estiver configurado
    if (process.env.RECAPTCHA_SECRET_KEY) {
      const recaptchaResult = await recaptchaService.verifyRecaptchaToken(recaptchaToken);
      if (!recaptchaResult.success) {
        return {
          success: false,
          error: recaptchaResult.error,
          statusCode: 403,
        };
      }
    }

    // Gerar ID da seção e link único
    const idSecao = generateSecaoId();
    const uniqueLink = `${urlLocal}/secao/${idSecao}`;
    const nome = idSecao;

    // Salvar no repositório
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
 * Valida o login de um usuário em uma seção com validação reCAPTCHA
 * @param {Object} data - Dados de login
 * @param {string} data.usuario - Nome do usuário
 * @param {string} data.idSecao - ID da seção
 * @param {string} data.recaptchaToken - Token do reCAPTCHA
 * @returns {Promise<Object>} { success: boolean, message?: string, error?: string, statusCode?: number }
 */
const loginSecao = async (data) => {
  const { usuario, idSecao, recaptchaToken } = data;

  try {
    // Verificar token reCAPTCHA se estiver configurado
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

    // Verificar se a seção existe
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
