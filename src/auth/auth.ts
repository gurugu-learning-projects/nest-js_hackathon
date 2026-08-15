import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../../generated/prisma/client.js';
import { env } from '../config/env.js';

if (!env.databaseUrl) {
  throw new Error('DATABASE_URL is required for Better Auth');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: env.databaseUrl,
  }),
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: ['PARTICIPANT', 'ADMIN'],
        required: false,
        defaultValue: 'PARTICIPANT',
        input: false,
      },
    },
  },
  trustedOrigins: env.betterAuthUrl ? [env.betterAuthUrl] : [],
});

export type Session = typeof auth.$Infer.Session;
