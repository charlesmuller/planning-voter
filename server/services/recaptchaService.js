const axios = require('axios');
const MESSAGES = require('../constants/messages');

const RECAPTCHA_API_URL = 'https://www.google.com/recaptcha/api/siteverify';
const RECAPTCHA_SCORE_THRESHOLD = 0.5;

/**
 * Verifies a reCAPTCHA token with Google's API
 * @param {string} token - reCAPTCHA token
 * @returns {Promise<Object>} { success: boolean, score?: number, error?: string }
 */
const verifyRecaptchaToken = async (token) => {
  if (!process.env.RECAPTCHA_SECRET_KEY) {
    throw new Error('RECAPTCHA_SECRET_KEY is not configured');
  }

  try {
    const response = await axios.post(RECAPTCHA_API_URL, null, {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: token,
      },
    });

    const { success, score } = response.data;

    // For reCAPTCHA v3, check the score
    // For reCAPTCHA v2, success is sufficient
    if (!success || (score && score < RECAPTCHA_SCORE_THRESHOLD)) {
      console.warn('reCAPTCHA validation failed:', { success, score });
      return {
        success: false,
        error: MESSAGES.RECAPTCHA_VALIDATION_FAILED,
      };
    }

    return {
      success: true,
      score,
    };
  } catch (error) {
    console.error('Erro ao verificar reCAPTCHA:', error.message);

    // Handle API errors
    if (error.response?.status === 400) {
      return {
        success: false,
        error: MESSAGES.RECAPTCHA_ERROR,
      };
    }

    throw error;
  }
};

module.exports = {
  verifyRecaptchaToken,
};
