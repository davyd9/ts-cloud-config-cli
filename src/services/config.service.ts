import { promises as fs } from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { ZodError } from 'zod';
import { topLevelConfigSchema, TopLevelConfig } from '../schemas/config.schema';

/**
 * A service class to handle the loading, parsing, and validation of configuration files.
 * It supports both JSON and YAML formats and uses Zod for robust schema validation.
 * This decouples file I/O and validation logic from the command implementations.
 */
class ConfigService {
  /**
   * Loads a configuration file from the given path, parses it based on its extension,
   * and validates its content against the defined Zod schema.
   *
   * @param filePath - The relative or absolute path to the configuration file.
   * @returns A promise that resolves with the validated configuration object.
   * @throws An error if the file does not exist, is unreadable, or fails validation.
   */
  public async loadAndValidate(filePath: string): Promise<TopLevelConfig> {
    const absolutePath = path.resolve(filePath);
    const fileContent = await this.readFile(absolutePath);
    const parsedContent = this.parseContent(fileContent, absolutePath);
    return this.validateSchema(parsedContent);
  }

  /**
   * Reads the content of a file.
   * @param filePath - The absolute path to the file.
   * @returns The file content as a string.
   * @throws An error if the file cannot be read.
   */
  private async readFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read configuration file at: ${filePath}`);
    }
  }

  /**
   * Parses the file content based on its extension.
   * @param content - The file content as a string.
   * @param filePath - The path to the file, used to determine the file type.
   * @returns The parsed content as a JavaScript object.
   * @throws An error if the file format is unsupported or parsing fails.
   */
  private parseContent(content: string, filePath: string): unknown {
    const extension = path.extname(filePath).toLowerCase();
    try {
      if (extension === '.json') {
        return JSON.parse(content);
      }
      if (extension === '.yaml' || extension === '.yml') {
        return yaml.load(content);
      }
      throw new Error(`Unsupported file format: ${extension}. Please use .json, .yaml, or .yml.`);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to parse ${filePath}: ${error.message}`);
      }
      throw new Error(`An unknown error occurred while parsing ${filePath}.`);
    }
  }

  /**
   * Validates the parsed content against the top-level configuration schema.
   * @param data - The parsed data to validate.
   * @returns The validated data, conforming to the TopLevelConfig type.
   * @throws A formatted error message if validation fails.
   */
  private validateSchema(data: unknown): TopLevelConfig {
    const validationResult = topLevelConfigSchema.safeParse(data);

    if (!validationResult.success) {
      const formattedError = this.formatZodError(validationResult.error);
      throw new Error(`Configuration validation failed:\n${formattedError}`);
    }

    return validationResult.data;
  }

  /**
   * Formats a ZodError into a readable string.
   * @param error - The ZodError instance.
   * @returns A string detailing the validation issues.
   */
  private formatZodError(error: ZodError): string {
    return error.issues
      .map(issue => `  - Path: [${issue.path.join('.') || 'root'}], Issue: ${issue.message}`)
      .join('\n');
  }
}

export const configService = new ConfigService();
