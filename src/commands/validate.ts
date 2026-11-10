import { Command } from 'commander';
import { ConfigService } from '../services/config.service';
import { logger } from '../utils/logger';
import { AppError } from '../errors/AppError';

export const validateCommand = new Command('validate')
  .description('Validate a configuration file against the defined schema for a specific environment.')
  .argument('<file>', 'Path to the configuration file (e.g., config.yml)')
  .option('-e, --env <environment>', 'The environment to validate (e.g., dev, staging, prod)', 'dev')
  .action(async (file: string, options: { env: string }) => {
    const configService = new ConfigService();

    try {
      logger.info(`Validating configuration file: ${file} for environment: ${options.env}`);

      const fullConfig = configService.loadAndValidate(file);
      logger.success('Configuration file syntax and schema are valid.');

      const envConfig = configService.getEnvironmentConfig(fullConfig, options.env);
      logger.info(`Configuration for environment '${options.env}':`);
      console.log(JSON.stringify(envConfig, null, 2));

      logger.success(`Successfully validated configuration for environment '${options.env}'.`);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        logger.error(error.message);
      } else if (error instanceof Error) {
        logger.error('An unexpected error occurred. Please see details below:');
        logger.error(error.stack || error.message);
      } else {
        logger.error('An unknown and unexpected error occurred.');
      }
      process.exit(1);
    }
  });
