import { z } from 'zod';

/**
 * Schema for a single environment's configuration.
 * Ensures that essential configuration variables are present and correctly typed.
 * This can be expanded with more specific validations (e.g., connection strings).
 */
export const environmentConfigSchema = z.object({
  DATABASE_URL: z.string().url({ message: 'Invalid DATABASE_URL format.' }),
  API_KEY: z.string().min(16, { message: 'API_KEY must be at least 16 characters long.' }),
  ENABLE_FEATURE_FLAG: z.boolean().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

/**
 * Schema for the entire configuration file, which can contain multiple environments.
 * It's a record where each key is an environment name (e.g., 'dev', 'prod')
 * and the value is an object matching the `environmentConfigSchema`.
 */
export const multiEnvConfigSchema = z.record(
  z.string().min(1, { message: 'Environment name cannot be empty.' }),
  environmentConfigSchema
);

// Infer TypeScript types from schemas for strong typing across the application
export type EnvironmentConfig = z.infer<typeof environmentConfigSchema>;
export type MultiEnvConfig = z.infer<typeof multiEnvConfigSchema>;
