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
  arcjetKey: process.env.ARCJET_KEY,
  arcjetEnv: process.env.ARCJET_ENV ?? 'development',
  arcjetMode: parseArcjetMode(process.env.ARCJET_MODE),
} as const;

export function validateEnv(): void {
  if (!env.arcjetKey) {
    throw new Error(
      'ARCJET_KEY is required. Get your key at https://app.arcjet.com',
    );
  }
}
