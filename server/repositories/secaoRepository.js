const db = require('../base');
const MESSAGES = require('../constants/messages');

/**
 * Creates a new section in the database
 * @param {Object} secaoData - Section data
 * @param {string} secaoData.nome - Section name/ID
 * @param {string} secaoData.uniqueLink - Unique link for the section
 * @returns {Promise<Object>} { success: boolean, result?: Object, error?: string }
 */
const createSecao = (secaoData) => {
  return new Promise((resolve, reject) => {
    const { nome, uniqueLink } = secaoData;
    const query = 'INSERT INTO secoes (nome, unique_link) VALUES (?, ?)';

    db.query(query, [nome, uniqueLink], (error, results) => {
      if (error) {
        console.error('Erro ao criar seção:', error);
        return reject(new Error(MESSAGES.SECAO_ERROR));
      }

      resolve({
        success: true,
        result: results,
      });
    });
  });
};

/**
 * Finds a section by ID
 * @param {string} idSecao - Section ID
 * @returns {Promise<Object>} { found: boolean, secao?: Object, error?: string }
 */
const findSecaoById = (idSecao) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM secoes WHERE nome = ?';

    db.query(query, [idSecao], (error, results) => {
      if (error) {
        console.error('Erro no banco:', error);
        return reject(new Error(MESSAGES.DB_ERROR));
      }

      if (results.length === 0) {
        return resolve({
          found: false,
        });
      }

      resolve({
        found: true,
        secao: results[0],
      });
    });
  });
};

/**
 * Checks if a section exists
 * @param {string} idSecao - Section ID
 * @returns {Promise<boolean>} True if section exists
 */
const secaoExists = async (idSecao) => {
  const result = await findSecaoById(idSecao);
  return result.found;
};

module.exports = {
  createSecao,
  findSecaoById,
  secaoExists,
};
