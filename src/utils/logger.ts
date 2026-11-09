import chalk from 'chalk';

/**
 * A simple logging utility that provides color-coded console output
 * for different message types, enhancing the readability of CLI feedback.
 */
export const logger = {
  /**
   * Logs informational messages.
   * @param message - The message to log.
   */
  info: (message: string): void => {
    console.log(chalk.blue(`[INFO] ${message}`));
  },

  /**
   * Logs success messages.
   * @param message - The message to log.
   */
  success: (message: string): void => {
    console.log(chalk.green(`[SUCCESS] ${message}`));
  },

  /**
   * Logs warning messages.
   * @param message - The message to log.
   */
  warn: (message: string): void => {
    console.log(chalk.yellow(`[WARN] ${message}`));
  },

  /**
   * Logs error messages.
   * @param message - The message to log.
   */
  error: (message: string): void => {
    console.error(chalk.red(`[ERROR] ${message}`));
  },

  /**
   * Logs a raw object to the console, typically for displaying
   * validated configuration data.
   * @param data - The object to log.
   */
  data: (data: unknown): void => {
    console.log(chalk.cyan(JSON.stringify(data, null, 2)));
  }
};
