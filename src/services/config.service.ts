import { promises as fs } from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { ZodError } from 'zod';
import { multiEnvConfigSchema, MultiEnvConfig, EnvironmentConfig } from '../schemas/config.schema';

export class ConfigService {
  /**
   * Loads, parses, and validates a configuration file.
   * Supports both JSON and YAML formats.
   * @param filePath - The absolute or relative path to the configuration file.
   * @returns A promise that resolves to the validated multi-environment configuration object.
   * @throws If the file is not found, cannot be parsed, or fails validation.
   */
  public async loadFile(filePath: string): Promise<MultiEnvConfig> {
    const absolutePath = path.resolve(filePath);

    try {
      await fs.access(absolutePath);
    } catch {
      throw new Error(`Configuration file not found at: ${absolutePath}`);
    }

    const fileContent = await fs.readFile(absolutePath, 'utf-8');
    const fileExtension = path.extname(absolutePath).toLowerCase();

    let parsedData: unknown;
    try {
      if (fileExtension === '.yaml' || fileExtension === '.yml') {
        parsedData = yaml.load(fileContent);
      } else if (fileExtension === '.json') {
        parsedData = JSON.parse(fileContent);
      } else {
        throw new Error(`Unsupported file type: ${fileExtension}. Please use .json, .yaml, or .yml.`);
      }
    } catch (error) {
      throw new Error(`Failed to parse configuration file: ${(error as Error).message}`);
    }

    const validationResult = multiEnvConfigSchema.safeParse(parsedData);

    if (!validationResult.success) {
      const formattedError = this.formatZodError(validationResult.error);
      throw new Error(`Configuration validation failed:\n${formattedError}`);
    }

    return validationResult.data;
  }

  /**
   * Retrieves the configuration for a specific environment from a loaded config object.
   * @param config - The multi-environment configuration object.
   * @param env - The name of the environment to retrieve (e.g., 'dev', 'prod').
   * @returns The configuration object for the specified environment.
   * @throws If the specified environment does not exist in the configuration.
   */
  public getEnvironment(config: MultiEnvConfig, env: string): EnvironmentConfig {
    if (!(env in config)) {
      const availableEnvs = Object.keys(config).join(', ');
      throw new Error(`Environment '${env}' not found in configuration. Available environments: ${availableEnvs}`);
    }
    return config[env];
  }

  /**
   * Formats a ZodError into a more readable string.
   * @param error - The ZodError instance.
   * @returns A formatted string of validation errors.
   */
  private formatZodError(error: ZodError): string {
    return error.errors
      .map((e) => `  - [${e.path.join('.') || 'root'}]: ${e.message}`)
      .join('\n');
  }
}
