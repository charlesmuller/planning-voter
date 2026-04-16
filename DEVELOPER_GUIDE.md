# Referência do Desenvolvedor - Adicionando Features

## Referência Rápida: Propósito dos Arquivos

| Arquivo | Propósito | Quando Modificar |
|---------|-----------|-----------------|
| `routes/secoes.js` | Roteamento HTTP | Adicionando novos endpoints |
| `controllers/secaoController.js` | Manipulação de requisições | Novos manipuladores HTTP |
| `services/secaoService.js` | Lógica de negócio de seções | Adicionando operações de seção |
| `services/recaptchaService.js` | Lógica de reCAPTCHA | Alterando provedor de validação |
| `validators/secaoValidator.js` | Validação de entrada | Adicionando regras de validação |
| `repositories/secaoRepository.js` | Consultas ao banco | Alterando banco ou lógica de query |
| `middleware/securityHeaders.js` | Cabeçalhos de segurança | Alterando política de segurança |
| `constants/messages.js` | Mensagens de erro/sucesso | Atualizando strings de usuário |

## Tarefas Comuns

### Tarefa 1: Adicionando uma Nova Regra de Validação

**Exemplo**: Adicionar validação de comprimento mínimo de username

**Arquivo**: `validators/secaoValidator.js`

```javascript
// Adicionar à função validateUsuario
const MIN_LENGTH = 3;   // Alterar mínimo
const MAX_LENGTH = 100; // Adicionar máximo se necessário

if (usuarioTrimmed.length < MIN_LENGTH) {
  return { isValid: false, error: 'Nome de usuário muito curto' };
}
```

### Tarefa 2: Adicionando uma Mensagem de Erro

**Arquivo**: `constants/messages.js`

```javascript
const MESSAGES = {
  // ... mensagens existentes
  NEW_ERROR_KEY: 'Mensagem de erro exibida ao usuário',
};
```

**Então use em validators/services/controllers**:
```javascript
return { isValid: false, error: MESSAGES.NEW_ERROR_KEY };
```

### Tarefa 3: Adicionando uma Nova Query ao Banco

**Arquivo**: `repositories/secaoRepository.js`

```javascript
/**
 * Encontra seções por username
 * @param {string} usuario - Username a buscar
 * @returns {Promise<Object>}
 */
const findSecoesByUsuario = (usuario) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM secoes WHERE usuario = ?';
    db.query(query, [usuario], (error, results) => {
      if (error) {
        console.error('Erro ao buscar seções:', error);
        return reject(new Error(MESSAGES.DB_ERROR));
      }
      resolve({ secoes: results });
    });
  });
};

module.exports = {
  // ... exports existentes
  findSecoesByUsuario,
};
```

### Tarefa 4: Adicionando Lógica de Negócio

**Arquivo**: `services/secaoService.js`

```javascript
/**
 * Obtém todas as seções de um usuário
 * @param {string} usuario - Nome de usuário
 * @returns {Promise<Object>}
 */
const listarSecoes = async (usuario) => {
  try {
    const result = await secaoRepository.findSecoesByUsuario(usuario);
    return {
      success: true,
      secoes: result.secoes,
    };
  } catch (error) {
    console.error('Erro ao listar seções:', error.message);
    return {
      success: false,
      error: MESSAGES.DB_ERROR,
      statusCode: 500,
    };
  }
};

module.exports = {
  // ... exports existentes
  listarSecoes,
};
```

### Tarefa 5: Adicionando um Manipulador de Controlador

**Arquivo**: `controllers/secaoController.js`

```javascript
/**
 * Controlador para listar seções do usuário
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
const listarSecoesController = async (req, res) => {
  try {
    const { usuario } = req.query;

    if (!usuario) {
      return res.status(400).json({ error: 'Nome de usuário obrigatório' });
    }

    const result = await secaoService.listarSecoes(usuario);

    if (!result.success) {
      return res.status(result.statusCode || 500)
        .json({ error: result.error });
    }

    res.json({ secoes: result.secoes });
  } catch (error) {
    console.error('Erro no controlador listarSecoes:', error);
    res.status(500).json({ error: 'Erro ao processar requisição' });
  }
};

module.exports = {
  // ... exports existentes
  listarSecoesController,
};
```

### Tarefa 6: Adicionando uma Nova Rota

**Arquivo**: `routes/secoes.js`

```javascript
const {
  // ... imports existentes
  listarSecoesController,
} = require('../controllers/secaoController');

// Adicionar após rotas existentes
router.get('/listar', listarSecoesController);

module.exports = router;
```

## Exemplos de Testes

### Teste Unitário: Validador

```javascript
// test/validators/secaoValidator.test.js
const validator = require('../../validators/secaoValidator');

describe('secaoValidator', () => {
  describe('validateUsuario', () => {
    it('deve aceitar nome de usuário válido', () => {
      const result = validator.validateUsuario('João Silva');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe('João Silva');
    });

    it('deve rejeitar nome de usuário muito curto', () => {
      const result = validator.validateUsuario('AB');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('3 e 100');
    });
  });
});
```

### Teste Unitário: Service (Mock Repository)

```javascript
// test/services/secaoService.test.js
const secaoService = require('../../services/secaoService');
const secaoRepository = require('../../repositories/secaoRepository');

jest.mock('../../repositories/secaoRepository');

describe('secaoService', () => {
  it('deve criar seção com dados válidos', async () => {
    secaoRepository.createSecao.mockResolvedValue({ success: true });

    const result = await secaoService.criarSecao({
      usuario: 'Test',
      recaptchaToken: 'mock-token'
    });

    expect(result.success).toBe(true);
    expect(result.idSecao).toBeDefined();
  });
});
```

### Teste de Integração: Controller + Service

```javascript
// test/controllers/secaoController.test.js
const request = require('supertest');
const app = require('../../server');

describe('GET /api/listar', () => {
  it('deve retornar seções para usuário válido', async () => {
    const response = await request(app)
      .get('/api/listar?usuario=TestUser');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('secoes');
  });

  it('deve retornar 400 sem nome de usuário', async () => {
    const response = await request(app).get('/api/listar');
    expect(response.status).toBe(400);
  });
});
```

## Registros de Decisões Arquiteturais

### Decisão 1: Por que Repositories baseados em Promise?

**Alternativa considerada**: Repositories baseados em callback
**Decisão**: Usar Promises para sintaxe async/await mais limpa em services
**Trade-off**: Overhead mínimo, mas melhoria significativa de legibilidade

### Decisão 2: Por que um Service recaptchaService separado?

**Alternativa considerada**: Inline em secaoService
**Decisão**: Extrair para service separado por responsabilidade única
**Benefício**: Pode trocar provedores ou testar independentemente

### Decisão 3: Por que Services retornam objetos de resultado?

**Alternativa considerada**: Lançar exceções
**Decisão**: Retornar objetos com { success, error, status }
**Benefício**: Manipulação de erro mais fácil em controllers, intenção clara

## Guias de Estilo de Código

1. **Sempre retorne objetos de resultado consistentes**:
   ```javascript
   { success: boolean, data?: any, error?: string, statusCode?: number }
   ```

2. **Use async/await em services**:
   ```javascript
   const result = await secaoRepository.findSecaoById(id);
   ```

3. **Valide cedo em controllers**:
   ```javascript
   const validation = secaoValidator.validateRequest(req.body);
   if (!validation.isValid) return res.status(400).json(...);
   ```

4. **Use mensagens centralizadas**:
   ```javascript
   // ✓ BOM
   error: MESSAGES.USUARIO_INVALIDO
   
   // ✗ EVITAR
   error: 'Usuário inválido'
   ```

5. **Registre erros com contexto**:
   ```javascript
   console.error('Erro ao criar seção:', error.message);
   ```

## Dicas de Depuração

### Ativar Logging de Requisição

Adicione a `middleware/logger.js`:
```javascript
const logger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
};
```

### Rastrear Chamadas de Service

Adicione console logs em services:
```javascript
const criarSecao = async (data) => {
  console.log('secaoService.criarSecao chamado com:', { usuario: data.usuario });
  // ... resto da lógica
};
```

### Verificar Queries do Banco

Ative logging de MySQL em base.js:
```javascript
db.on('query', query => console.log('SQL:', query.sql));
```

## Otimização de Performance

### Gargalos Identificados
1. **Verificação reCAPTCHA** - ~300ms chamada Google API
   - Solução: Cache de verificação por sessão
   
2. **Queries do banco** - SELECT único por requisição
   - Solução: Adicionar índices no banco na coluna `nome`

3. **Promise wrapping** - Overhead mínimo
   - Solução: Considerar connection pooling no repository

## Migração para Produção

1. **Teste localmente**:
   ```bash
   npm test
   npm start
   ```

2. **Deploy do código server**:
   - Git push → GitHub Actions build
   - Imagem Docker criada
   - SSH para server: `docker-compose up`

3. **Verifique compatibilidade**:
   - Requisições do cliente funcionam sem mudanças
   - Todos endpoints respondem corretamente
   - Mensagens de erro coincidem

4. **Monitore**:
   - Verifique logs para erros
   - Monitore taxa de sucesso do reCAPTCHA
   - Acompanhe tempos de resposta

## Rollback se Necessário

```bash
# Reverter para versão anterior
git revert <commit-hash>
git push
# GitHub Actions automaticamente redeploy
```

A versão anterior monolítica ainda está no histórico git se necessário.
