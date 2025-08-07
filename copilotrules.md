# Planning Voter - Regras e Documentação de Referência

## Visão Geral do Projeto
O Planning Voter é uma aplicação para votação em tempo real, desenvolvida usando React no frontend e Node.js (Express) no backend, com comunicação via WebSocket e containerização Docker.

## Estrutura do Projeto
```
planning-voter/
├── client/                  # Frontend React
│   ├── src/
│   │   ├── componentes/    # Componentes React
│   │   ├── api/           # Serviços de API
│   │   └── comunication/  # Configurações WebSocket
├── server/                 # Backend Node.js
│   ├── routes/            # Rotas da API
│   └── server.js          # Configuração principal
└── docker-compose.yml     # Configuração Docker
```

## Regras de Desenvolvimento

### 1. Frontend (React)
- Seguir os princípios do React conforme [documentação oficial](https://react.dev/learn)
- Padrões obrigatórios:
  - Componentização para reuso de código
  - Uso de hooks para gerenciamento de estado
  - Props typing para validação de propriedades
  - Organização em diretórios por funcionalidade
  - CSS modular por componente
  - Comunicação via WebSocket para atualizações em tempo real

### 2. Backend (Express)
- Seguir as práticas da [documentação Express](https://expressjs.com/)
- Padrões obrigatórios:
  - Rotas organizadas em módulos separados
  - Middleware para tratamento de erros
  - Validação de entrada de dados
  - Gerenciamento de sessões via WebSocket
  - Tratamento adequado de CORS
  - Logging de eventos importantes

### 3. Docker
- Seguir as melhores práticas do [Docker](https://docs.docker.com/)
- Padrões obrigatórios:
  - Uso de multi-stage builds quando apropriado
  - Otimização de camadas
  - Configurações separadas para dev e prod
  - Volumes para desenvolvimento
  - Rede isolada entre serviços
  - Variáveis de ambiente via .env

### 4. Base de Dados (MySQL)
- Seguir as práticas da [documentação MySQL](https://dev.mysql.com/doc/)
- Padrões obrigatórios:
  - Normalização de tabelas
  - Índices otimizados
  - Backup automático
  - Migrations para alterações de schema
  - Conexões pool para eficiência

## Padrões de Código

### Nomenclatura
- Componentes React: PascalCase
- Funções e variáveis: camelCase
- Constantes: UPPER_SNAKE_CASE
- Arquivos de componente: mesmo nome do componente
- Arquivos de estilo: ComponentName.css

### Estilo de Código
- Indentação: 2 espaços
- Ponto e vírgula ao final das declarações
- Chaves em nova linha
- Strings com aspas simples
- Desestruturação para props

### Commits
- Formato: `tipo(escopo): descrição`
- Tipos: feat, fix, docs, style, refactor, test, chore
- Mensagens em português
- Descrições claras e concisas

## Processo de Desenvolvimento

### 1. Antes de Cada Alteração
- Verificar esta documentação
- Entender o contexto da mudança
- Planejar a implementação
- Criar branch específica

### 2. Durante o Desenvolvimento
- Seguir padrões estabelecidos
- Testar localmente
- Documentar alterações
- Manter código limpo

### 3. Antes do Commit
- Verificar lint
- Rodar testes
- Revisar alterações
- Atualizar documentação se necessário

## Documentações de Referência

- React: [https://react.dev/learn](https://react.dev/learn)
- Express: [https://expressjs.com/](https://expressjs.com/)
- Docker: [https://docs.docker.com/](https://docs.docker.com/)
- MySQL: [https://dev.mysql.com/doc/](https://dev.mysql.com/doc/)

## Observações Importantes

1. Toda alteração deve seguir estas regras
2. Em caso de dúvida, consultar a documentação oficial
3. Manter este documento atualizado
4. Documentar decisões importantes
5. Priorizar segurança e performance

## Fluxo de Trabalho com GitHub Copilot

1. Consultar este documento antes de solicitar alterações
2. Fornecer contexto claro nas solicitações
3. Verificar se as sugestões seguem os padrões
4. Validar alterações propostas
5. Manter consistência com o código existente
