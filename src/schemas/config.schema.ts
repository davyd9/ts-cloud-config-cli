import { z } from 'zod';

/**
 * Schema for a single environment's configuration.
 * This defines the expected structure for settings like database URLs, API keys,
 * and feature flags.
 */
export const environmentConfigSchema = z.object({
  database: z.object({
    url: z.string().url({ message: 'Invalid database URL format.' }),
    poolSize: z.number().int().positive().optional().default(10),
  }),
  api: z.object({
    key: z.string().min(32, { message: 'API key must be at least 32 characters long.' }),
    baseUrl: z.string().url({ message: 'Invalid API base URL.' }),
  }),
  logging: z.object({
    level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  }),
  featureFlags: z.record(z.string(), z.boolean()).optional().default({}),
});

/**
 * Top-level schema for the entire configuration file.
 * It expects a map of environment names (e.g., "development", "production")
 * to their respective configuration objects, validated by `environmentConfigSchema`.
 * It also ensures that at least one environment is defined.
 */
export const topLevelConfigSchema = z.record(
  z.string().min(1, { message: 'Environment name cannot be empty.' }),
  environmentConfigSchema
).min(1, { message: 'Configuration file must contain at least one environment.' });

// Type inference for easy use in other parts of the application
export type EnvironmentConfig = z.infer<typeof environmentConfigSchema>;
export type TopLevelConfig = z.infer<typeof topLevelConfigSchema>;
