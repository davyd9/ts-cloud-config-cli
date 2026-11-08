import chalk from 'chalk';

/**
 * A simple logger utility for consistent, colored console output.
 */
class Logger {
  /**
   * Logs a standard message to the console.
   * @param message - The message to log.
   */
  public log(message: string): void {
    console.log(message);
  }

  /**
   * Logs an informational message, typically in blue.
   * @param message - The message to log.
   */
  public info(message: string): void {
    console.log(chalk.blue(`[INFO] ${message}`));
  }

  /**
   * Logs a success message, typically in green.
   * @param message - The message to log.
   */
  public success(message: string): void {
    console.log(chalk.green(`[SUCCESS] ${message}`));
  }

  /**
   * Logs a warning message, typically in yellow.
   * @param message - The message to log.
   */
  public warn(message: string): void {
    console.warn(chalk.yellow(`[WARN] ${message}`));
  }

  /**
   * Logs an error message, typically in red.
   * @param message - The message to log.
   */
  public error(message: string): void {
    console.error(chalk.red(`[ERROR] ${message}`));
  }
}

export const logger = new Logger();
