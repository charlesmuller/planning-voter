const secaoValidator = require('../validators/secaoValidator');
const secaoService = require('../services/secaoService');

/**
 * Controlador para criação de nova seção
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
const criarSecaoController = async (req, res) => {
  try {
    // Validar corpo da requisição
    const validation = secaoValidator.validateCreateSecaoRequest(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    // Create section through service
    const result = await secaoService.criarSecao(validation.data);

    if (!result.success) {
      return res.status(result.statusCode || 500).json({ error: result.error });
    }

    res.header('Content-Type', 'application/json');
    res.json({
      idSecao: result.idSecao,
      url: result.url,
    });
  } catch (error) {
    console.error('Erro no controlador criarSecao:', error);
    res.status(500).json({ error: 'Erro ao processar requisição' });
  }
};

/**
 * Controlador para login de usuário em uma seção
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
const loginController = async (req, res) => {
  try {
    // Validar corpo da requisição
    const validation = secaoValidator.validateLoginRequest(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    // Login through service
    const result = await secaoService.loginSecao(validation.data);

    if (!result.success) {
      return res.status(result.statusCode).json({ error: result.error });
    }

    res.status(result.statusCode).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Erro no controlador login:', error);
    res.status(500).json({ error: 'Erro ao processar login' });
  }
};

/**
 * Controlador para validar uma seção
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
const validarSecaoController = async (req, res) => {
  try {
    const { idSecao } = req.params;

    // Validar formato do ID da seção
    const validation = secaoValidator.validateIdSecao(idSecao);
    if (!validation.isValid) {
      return res.status(400).json({ valida: false, error: validation.error });
    }

    // Check if section is valid
    const result = await secaoService.isSecaoValida(validation.value);

    if (result.error) {
      return res.status(500).json({ valida: false, error: result.error });
    }

    res.json({ valida: result.valida });
  } catch (error) {
    console.error('Erro no controlador validarSecao:', error);
    res.status(500).json({ valida: false, error: 'Erro ao processar requisição' });
  }
};

/**
 * Controlador para geração de token CSRF
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
const getCsrfTokenController = (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
};

/**
 * Controlador para health check
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
const healthCheckController = (req, res) => {
  // Verificar se a requisição vem do localhost
  const requestIP = req.ip || req.connection.remoteAddress;
  const isLocalhost =
    requestIP === '127.0.0.1' ||
    requestIP === '::1' ||
    requestIP.includes('::ffff:127.0.0.1');

  // Verificar cabeçalho de autenticação
  const authHeader = req.headers['x-health-check-key'];
  const isValidKey = authHeader === process.env.HEALTH_CHECK_KEY;

  if (!isLocalhost || !isValidKey) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  // Return minimal response
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
};

module.exports = {
  criarSecaoController,
  loginController,
  validarSecaoController,
  getCsrfTokenController,
  healthCheckController,
};
