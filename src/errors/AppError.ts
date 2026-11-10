/**
 * @class AppError
 * @description Custom error class for handling application-specific, user-facing errors.
 * It allows for consistent error handling and messaging throughout the CLI,
 * distinguishing between expected operational errors and unexpected system errors.
 */
export class AppError extends Error {
  /**
   * Creates an instance of AppError.
   * @param {string} message - The user-friendly error message.
   */
  constructor(message: string) {
    super(message);
    this.name = 'AppError';

    // This is necessary to restore the prototype chain in some environments (e.g., TypeScript targets < ES6)
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
