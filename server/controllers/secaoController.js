const secaoValidator = require('../validators/secaoValidator');
const secaoService = require('../services/secaoService');

/**
 * Controller for creating a new section
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const criarSecaoController = async (req, res) => {
  try {
    // Validate request body
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
 * Controller for user login to a section
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const loginController = async (req, res) => {
  try {
    // Validate request body
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
 * Controller for validating a section
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const validarSecaoController = async (req, res) => {
  try {
    const { idSecao } = req.params;

    // Validate section ID format
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
 * Controller for CSRF token generation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCsrfTokenController = (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
};

/**
 * Controller for health check
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const healthCheckController = (req, res) => {
  // Verify if request comes from localhost
  const requestIP = req.ip || req.connection.remoteAddress;
  const isLocalhost =
    requestIP === '127.0.0.1' ||
    requestIP === '::1' ||
    requestIP.includes('::ffff:127.0.0.1');

  // Check authentication header
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
