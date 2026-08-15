import { loadEnvFile } from 'node:process';

loadEnvFile('.env');

export type ArcjetMode = 'LIVE' | 'DRY_RUN';

function parseArcjetMode(value: string | undefined): ArcjetMode {
  if (value === 'LIVE' || value === 'DRY_RUN') {
    return value;
  }

  return 'DRY_RUN';
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL,
  arcjetKey: process.env.ARCJET_KEY,
  arcjetEnv: process.env.ARCJET_ENV ?? 'development',
  arcjetMode: parseArcjetMode(process.env.ARCJET_MODE),
  betterAuthSecret: process.env.BETTER_AUTH_SECRET,
  betterAuthUrl: process.env.BETTER_AUTH_URL,
} as const;

export function validateEnv(): void {
  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  if (!env.arcjetKey) {
    throw new Error(
      'ARCJET_KEY is required. Get your key at https://app.arcjet.com',
    );
  }

  if (!env.betterAuthSecret || env.betterAuthSecret.length < 32) {
    throw new Error(
      'BETTER_AUTH_SECRET is required and must be at least 32 characters. Generate with: openssl rand -base64 32',
    );
  }

  if (!env.betterAuthUrl) {
    throw new Error(
      'BETTER_AUTH_URL is required (public base URL of the API, e.g. http://localhost:3000)',
    );
  }
}
