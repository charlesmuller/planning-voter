// Centralized error and success messages
const MESSAGES = {
  // Validation errors
  RECAPTCHA_TOKEN_MISSING: 'reCAPTCHA token ausente',
  USUARIO_INVALIDO: 'Nome de usuário inválido',
  USUARIO_LENGTH: 'Nome de usuário deve ter entre 3 e 100 caracteres',
  SECAO_INVALIDA: 'Seção inválida',
  USUARIO_REQUIRED: 'Usuário inválido',
  IDRECAPTCHA_MISSING: 'Token reCAPTCHA ausente',

  // reCAPTCHA errors
  RECAPTCHA_VALIDATION_FAILED: 'Validação de reCAPTCHA falhou',
  RECAPTCHA_ERROR: 'Erro na validação de reCAPTCHA',

  // Database errors
  DB_ERROR: 'Erro no servidor',
  SECAO_ERROR: 'Erro ao criar seção',
  SECAO_NOT_FOUND: 'Seção não encontrada',

  // Success messages
  LOGIN_SUCCESS: 'Login realizado com sucesso',
  SECAO_CREATED: 'Seção criada com sucesso',

  // Health check errors
  UNAUTHORIZED: 'Unauthorized',
};

module.exports = MESSAGES;
