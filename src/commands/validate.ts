import { Command } from 'commander';
import { configService } from '../services/config.service';
import { logger } from '../utils/logger';

const validateCommand = new Command('validate');

validateCommand
  .description('Validate a configuration file against the defined schema.')
  .argument('<file>', 'Path to the configuration file (e.g., config.yml)')
  .option('-e, --env <environment>', 'Validate and display a specific environment configuration')
  .action(async (file: string, options: { env?: string }) => {
    logger.info(`Validating configuration file: ${file}`);

    try {
      const config = await configService.loadAndValidate(file);

      if (options.env) {
        const envConfig = config[options.env];
        if (!envConfig) {
          logger.error(`Environment '${options.env}' not found in the configuration file.`);
          logger.info(`Available environments: ${Object.keys(config).join(', ')}`);
          process.exit(1);
        }
        logger.success(`Configuration for environment '${options.env}' is valid.`);
        logger.data(envConfig);
      } else {
        logger.success('The entire configuration file is valid.');
        logger.data(config);
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(error.message);
      } else {
        logger.error('An unknown error occurred during validation.');
      }
      process.exit(1);
    }
  });

export default validateCommand;
