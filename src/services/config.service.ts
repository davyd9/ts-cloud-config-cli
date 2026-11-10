import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { z, ZodError } from 'zod';
import { configSchema, environmentSchema } from '../schemas/config.schema';
import { AppError } from '../errors/AppError';

export class ConfigService {
  private readonly configSchema = configSchema;

  /**
   * Formats a ZodError into a user-friendly, readable string.
   * @param {ZodError} error - The ZodError instance.
   * @returns {string} A formatted error message.
   */
  private _formatZodError(error: ZodError): string {
    const issues = error.issues.map(issue => {
      const pathString = issue.path.join('.');
      return `  - At path '${pathString}': ${issue.message}.`;
    });
    return `Configuration validation failed with the following issues:
${issues.join('\n')}`;
  }

  /**
   * Loads, parses, and validates a configuration file.
   * @param {string} filePath - The path to the configuration file.
   * @returns {z.infer<typeof this.configSchema>} The validated configuration object.
   * @throws {AppError} If the file is not found, cannot be parsed, or fails validation.
   */
  public loadAndValidate(filePath: string): z.infer<typeof this.configSchema> {
    const absolutePath = path.resolve(filePath);
    let fileContent: string;

    try {
      fileContent = fs.readFileSync(absolutePath, 'utf8');
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new AppError(`Configuration file not found at: ${absolutePath}\nPlease check the path and try again.`);
      }
      throw new AppError(`Failed to read file at: ${absolutePath}. Reason: ${error.message}`);
    }

    let data: unknown;
    try {
      // js-yaml can also parse JSON, so we can use it as a universal parser.
      data = yaml.load(fileContent);
      if (data === null || typeof data !== 'object') {
        throw new AppError(`The configuration file at ${absolutePath} is empty or not a valid object.`);
      }
    } catch (error: any) {
      throw new AppError(`Failed to parse configuration file at: ${absolutePath}. Please check for YAML/JSON syntax errors.\nDetails: ${error.message}`);
    }

    try {
      return this.configSchema.parse(data);
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const formattedMessage = this._formatZodError(error);
        throw new AppError(formattedMessage);
      }
      // Re-throw unexpected errors during parsing
      throw error;
    }
  }

  /**
   * Retrieves the configuration for a specific environment.
   * @param {z.infer<typeof this.configSchema>} config - The full, validated configuration object.
   * @param {string} environment - The name of the target environment (e.g., 'dev', 'prod').
   * @returns {z.infer<typeof environmentSchema>} The configuration for the specified environment.
   * @throws {AppError} If the specified environment is not defined in the configuration file.
   */
  public getEnvironmentConfig(
    config: z.infer<typeof this.configSchema>,
    environment: string
  ): z.infer<typeof environmentSchema> {
    const envConfig = config[environment];
    if (!envConfig) {
      const availableEnvs = Object.keys(config).join(', ');
      throw new AppError(`Environment '${environment}' not found in the configuration file.\nAvailable environments: ${availableEnvs}`);
    }
    return envConfig;
  }
}
