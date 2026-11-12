[English](README.md) | [Português (BR)](README.pt-br.md)

# ts-cloud-config-cli

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)

Uma ferramenta CLI robusta para validar arquivos de configuração de múltiplos ambientes de nuvem e aplicação.

![Terminal Execution Demo](assets/terminal_demo.svg)

## Visão Geral

Gerenciar Infraestrutura como Código (IaC) e variáveis de ambiente em múltiplos ambientes de nuvem (dev, staging, prod) é frequentemente um processo manual, propenso a erros e que consome muito tempo. Um valor de configuração ausente ou incorreto pode levar a falhas inesperadas de deploy, tempo de inatividade e vulnerabilidades de segurança. O `ts-cloud-config-cli` resolve isso fornecendo uma maneira rápida, confiável e automatizada de validar seus arquivos de configuração contra um schema definido antes que eles sejam usados.

## Funcionalidades

- **Validação Guiada por Schema**: Usa Zod para definir e impor schemas fortes e declarativos para suas configurações.
- **Suporte a Múltiplos Ambientes**: Gerencie configurações para `development`, `staging`, `production` e mais a partir de um único arquivo.
- **Formatos Flexíveis**: Suporta nativamente arquivos de configuração `YAML` e `JSON`.
- **Tratamento Robusto de Erros**: Fornece mensagens de erro claras e acionáveis para arquivo não encontrado, erros de parsing e falhas de validação.
- **Saída Amigável ao Desenvolvedor**: Logging estruturado e com código de cores para melhor legibilidade.
- **Arquitetura Extensível**: Construído com um design modular, facilitando a adição de novos comandos e funcionalidades.

## Arquitetura

A CLI é construída com uma arquitetura limpa, modular e desacoplada para garantir a manutenibilidade e testabilidade. O fluxo de dados vai da camada de interface do usuário até a lógica de serviço principal, com utilitários compartilhados para logging e tratamento de erros.

```mermaid
graph TD
    subgraph CLI Interface
        A[Usuário executa 'ts-cloud-config-cli validate <arquivo>'] --> B{index.ts};
        B -- Captura erros globais --> C[cli.ts];
        C -- Usa Commander.js para analisar args e rotear comando --> D[commands/validate.ts];
    end

    subgraph Lógica Principal
        D -- Invoca camada de serviço --> E[services/config.service.ts];
        E -- 1. Lê arquivo (fs) --> F[config.yml / config.json];
        E -- 2. Analisa conteúdo (js-yaml) --> G[Objeto JS];
        E -- 3. Valida contra o schema --> H[schemas/config.schema.ts];
    end

    subgraph Utilitários Compartilhados
        H -- Define schema Zod --> G;
        D -- Trata erros específicos do comando --> I[utils/logger.ts];
        E -- Encapsula erros em AppError --> J[errors/AppError.ts];
        B -- Trata AppError --> I;
        I -- Imprime saída formatada no console --> K[Saída do Console];
    end

    style F fill:#f9f,stroke:#333,stroke-width:2px
    style K fill:#ccf,stroke:#333,stroke-width:2px
```

## Guia Rápido

### Pré-requisitos

- Node.js >= 18.x
- npm ou yarn

### 1. Instalação

Clone o repositório e instale as dependências:

```bash
# Clone o repositório
git clone https://github.com/davyd9/ts-cloud-config-cli.git

# Navegue para o diretório do projeto
cd ts-cloud-config-cli

# Instale as dependências
npm install

# Crie um link simbólico para a CLI (opcional, para desenvolvimento)
npm link
```

### 2. Crie um Arquivo de Configuração

Crie um arquivo `config.yml` ou `config.json` com suas configurações de ambiente. O arquivo deve conter chaves para `development`, `staging` e `production`.

**Exemplo `config.yml`:**

```yaml
development:
  database_url: "postgres://dev:pass@localhost:5432/dev_db"
  api_key: "dev_secret_key"
  feature_flags:
    - "new-dashboard"

staging:
  database_url: "postgres://staging:pass@staging-db:5432/staging_db"
  api_key: "staging_secret_key"
  feature_flags:
    - "new-dashboard"
    - "beta-feature"

production:
  database_url: "postgres://prod:pass@prod-db:5432/prod_db"
  api_key: "prod_secret_key"
  feature_flags: []
```

**Exemplo `config.json`:**

```json
{
  "development": {
    "database_url": "postgres://dev:pass@localhost:5432/dev_db",
    "api_key": "dev_secret_key",
    "feature_flags": [
      "new-dashboard"
    ]
  },
  "staging": {
    "database_url": "postgres://staging:pass@staging-db:5432/staging_db",
    "api_key": "staging_secret_key",
    "feature_flags": [
      "new-dashboard",
      "beta-feature"
    ]
  },
  "production": {
    "database_url": "postgres://prod:pass@prod-db:5432/prod_db",
    "api_key": "prod_secret_key",
    "feature_flags": []
  }
}
```

### 3. Uso

Execute o comando `validate`, passando o caminho para o seu arquivo de configuração.

```bash
# Usando a CLI com link simbólico
ts-cloud-config-cli validate ./config.yml

# Ou usando scripts do npm
node dist/index.js validate ./config.yml
```

**Saída de Sucesso:**

```
✅ Success: Configuration file './config.yml' is valid.
```

**Saída de Erro (ex: `api_key` faltando em produção):**

```
❌ Error: Configuration validation failed for file: ./config.yml
[Zod Validation Error]:
- Path: ["production", "api_key"], Message: Required
```

## Executando Testes

Este projeto usa Jest para testes unitários e de integração. Para executar a suíte de testes:

```bash
npm test
```

Para executar os testes com um relatório de cobertura:

```bash
npm test -- --coverage
```

## Decisões Técnicas

- **TypeScript**: Escolhido por suas capacidades de tipagem forte, que são cruciais para construir aplicações confiáveis e escaláveis. Ajuda a capturar erros durante o desenvolvimento e melhora a qualidade e a manutenibilidade do código.
- **Commander.js**: Uma biblioteca poderosa e flexível para construir interfaces de linha de comando em Node.js. Simplifica a análise de argumentos, o registro de comandos e a geração de textos de ajuda.
- **Zod**: Selecionado por sua declaração de schema e validação expressiva e poderosa. Sua abordagem "TypeScript-first" nos permite inferir tipos estáticos diretamente dos schemas, eliminando a duplicação de tipos.
- **Suporte a YAML & JSON**: `js-yaml` foi integrado ao lado do parsing nativo de JSON para fornecer aos usuários flexibilidade na escolha do formato de configuração, já que YAML é frequentemente preferido por sua legibilidade.
- **Tratamento de Erro Personalizado (`AppError`)**: Uma classe de erro personalizada foi criada para padronizar o tratamento de erros. Isso nos permite diferenciar entre erros esperados da aplicação (ex: falha de validação) e erros inesperados do sistema, fornecendo mensagens mais claras e amigáveis ao usuário.
- **Arquitetura Modular**: A base de código é organizada por funcionalidade (comandos, serviços, schemas) para promover alta coesão и baixo acoplamento. Essa separação de responsabilidades, inspirada nos princípios da Clean Architecture, torna o sistema mais fácil de testar, manter e estender.

## Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.