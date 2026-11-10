#!/usr/bin/env node

import { runCli } from './cli';
import { logger } from './utils/logger';
import { AppError } from './errors/AppError';

/**
 * Main application entry point.
 * Executes the CLI and handles top-level errors.
 */
(async () => {
  try {
    await runCli(process.argv);
  } catch (error: unknown) {
    if (error instanceof AppError) {
      // Handled operational errors with user-friendly messages
      logger.error(error.message);
    } else if (error instanceof Error) {
      // Unexpected errors
      logger.error('An unexpected error occurred. Run with a debug flag for more details.');
      // In a real app, you might want to log the stack trace to a file or service
      // For now, we keep the output clean for the user.
      // console.error(error.stack);
    } else {
      // Non-error objects thrown
      logger.error('An unknown error occurred.');
    }
    process.exit(1);
  }
})();
