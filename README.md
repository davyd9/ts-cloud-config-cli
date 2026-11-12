[English](README.md) | [Português (BR)](README.pt-br.md)

# ts-cloud-config-cli

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)

A robust CLI tool for validating multi-environment cloud and application configuration files.

![Terminal Execution Demo](assets/terminal_demo.svg)

## Overview

Managing Infrastructure as Code (IaC) and environment variables across multiple cloud environments (dev, staging, prod) is often a manual, error-prone, and time-consuming process. A missing or incorrect configuration value can lead to unexpected deployment failures, downtime, and security vulnerabilities. `ts-cloud-config-cli` solves this by providing a fast, reliable, and automated way to validate your configuration files against a defined schema before they are ever used.

## Key Features

- **Schema-Driven Validation**: Uses Zod to define and enforce strong, declarative schemas for your configurations.
- **Multi-Environment Support**: Manage configurations for `development`, `staging`, `production`, and more from a single file.
- **Flexible Formats**: Natively supports both `YAML` and `JSON` configuration files.
- **Robust Error Handling**: Provides clear, actionable error messages for file not found, parsing errors, and validation failures.
- **Developer-Friendly Output**: Color-coded and structured logging for better readability.
- **Extensible Architecture**: Built with a modular design, making it easy to add new commands and features.

## Architecture

The CLI is built with a clean, modular, and decoupled architecture to ensure maintainability and testability. The data flows from the user interface layer down to the core service logic, with shared utilities for logging and error handling.

```mermaid
graph TD
    subgraph CLI Interface
        A[User runs 'ts-cloud-config-cli validate <file>'] --> B{index.ts};
        B -- Catches global errors --> C[cli.ts];
        C -- Uses Commander.js to parse args & route command --> D[commands/validate.ts];
    end

    subgraph Core Logic
        D -- Invokes service layer --> E[services/config.service.ts];
        E -- 1. Reads file (fs) --> F[config.yml / config.json];
        E -- 2. Parses content (js-yaml) --> G[JS Object];
        E -- 3. Validates against schema --> H[schemas/config.schema.ts];
    end

    subgraph Shared Utilities
        H -- Defines Zod schema --> G;
        D -- Handles command-specific errors --> I[utils/logger.ts];
        E -- Wraps errors in AppError --> J[errors/AppError.ts];
        B -- Handles AppError --> I;
        I -- Prints formatted output to console --> K[Console Output];
    end

    style F fill:#f9f,stroke:#333,stroke-width:2px
    style K fill:#ccf,stroke:#333,stroke-width:2px
```

## Quickstart

### Prerequisites

- Node.js >= 18.x
- npm or yarn

### 1. Installation

Clone the repository and install the dependencies:

```bash
# Clone the repository
git clone https://github.com/davyd9/ts-cloud-config-cli.git

# Navigate to the project directory
cd ts-cloud-config-cli

# Install dependencies
npm install

# Link the CLI for global access (optional, for development)
npm link
```

### 2. Create a Configuration File

Create a `config.yml` or `config.json` file with your environment settings. The file must contain keys for `development`, `staging`, and `production`.

**Example `config.yml`:**

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

**Example `config.json`:**

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

### 3. Usage

Run the `validate` command, passing the path to your configuration file.

```bash
# Using the linked CLI
ts-cloud-config-cli validate ./config.yml

# Or using npm scripts
node dist/index.js validate ./config.yml
```

**Success Output:**

```
✅ Success: Configuration file './config.yml' is valid.
```

**Error Output (e.g., missing `api_key` in production):**

```
❌ Error: Configuration validation failed for file: ./config.yml
[Zod Validation Error]:
- Path: ["production", "api_key"], Message: Required
```

## Running Tests

This project uses Jest for unit and integration testing. To run the test suite:

```bash
npm test
```

To run tests with coverage report:

```bash
npm test -- --coverage
```

## Technical Decisions

- **TypeScript**: Chosen for its strong typing capabilities, which are crucial for building reliable and scalable applications. It helps catch errors during development and improves code quality and maintainability.
- **Commander.js**: A powerful and flexible library for building Node.js command-line interfaces. It simplifies argument parsing, command registration, and help text generation.
- **Zod**: Selected for its expressive and powerful schema declaration and validation. Its TypeScript-first approach allows us to infer static types directly from schemas, eliminating type duplication.
- **YAML & JSON Support**: `js-yaml` was integrated alongside native JSON parsing to provide users with flexibility in their choice of configuration format, as YAML is often preferred for its readability.
- **Custom Error Handling (`AppError`)**: A custom error class was created to standardize error handling. This allows us to differentiate between expected application errors (e.g., validation failure) and unexpected system errors, providing clearer, user-friendly messages.
- **Modular Architecture**: The codebase is organized by feature (commands, services, schemas) to promote high cohesion and low coupling. This separation of concerns, inspired by Clean Architecture principles, makes the system easier to test, maintain, and extend.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.