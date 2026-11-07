#!/usr/bin/env node

import { run } from './cli';

/**
 * Main entry point for the CLI application.
 * This self-invoking async function initializes the CLI and handles graceful shutdown.
 */
(async () => {
  try {
    await run();
  } catch (error) {
    console.error('An unexpected error occurred:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
})();
