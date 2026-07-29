import { loadEnvFile } from 'node:process';
import { defineConfig } from 'prisma/config';

try {
  loadEnvFile('.env');
} catch {
  // .env is optional for prisma generate in CI or fresh clones
}

const databaseUrl =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/hackathon';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: databaseUrl,
  },
});
