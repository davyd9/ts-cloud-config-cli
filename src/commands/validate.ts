import { Command } from 'commander';
import { ConfigService } from '../services/config.service';
import { logger } from '../utils/logger';

const validate = new Command('validate');

validate
  .description('Validate a configuration file for a specific environment')
  .argument('<file>', 'Path to the configuration file (e.g., config.yaml)')
  .requiredOption('-e, --env <environment>', 'The environment to validate (e.g., dev, staging, prod)')
  .action(async (filePath: string, options: { env: string }) => {
    const { env } = options;
    const configService = new ConfigService();

    try {
      logger.info(`Starting validation for file: ${filePath} against environment: ${env}`);

      // 1. Load, parse, and validate the structure of the entire file
      const fullConfig = await configService.loadFile(filePath);
      logger.success('File parsed and schema structure is valid.');

      // 2. Select and retrieve the specific environment configuration
      const envConfig = configService.getEnvironment(fullConfig, env);
      logger.success(`Successfully validated and retrieved configuration for environment: '${env}'.`);

      // 3. Display the validated configuration for the user
      logger.log('\n--- Validated Configuration ---');
      console.log(envConfig);
      logger.log('-----------------------------\n');

    } catch (error) {
      if (error instanceof Error) {
        logger.error(error.message);
      } else {
        logger.error('An unknown error occurred during validation.');
      }
      process.exit(1);
    }
  });

export default validate;
