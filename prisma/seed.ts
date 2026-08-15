/**
 * Creates (or elevates) one ADMIN user for local/dev use.
 *
 * Usage:
 *   npm run db:seed
 *
 * Env (optional overrides):
 *   ADMIN_EMAIL    default: admin@example.com
 *   ADMIN_PASSWORD default: ChangeMeAdmin123!
 *   ADMIN_NAME     default: Admin
 *
 * Public sign up cannot set role; this script signs up as PARTICIPANT then
 * elevates role in the database.
 */
import { loadEnvFile } from 'node:process';

import { PrismaPg } from '@prisma/adapter-pg';
import { hashPassword } from 'better-auth/crypto';

import { PrismaClient } from '../generated/prisma/client.js';

try {
  loadEnvFile('.env');
} catch {
  // optional when env is already set
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to seed');
}

const email = process.env.ADMIN_EMAIL ?? 'admin@example.com';
const password = process.env.ADMIN_PASSWORD ?? 'ChangeMeAdmin123!';
const name = process.env.ADMIN_NAME ?? 'Admin';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

async function seed(): Promise<void> {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    if (existing.role !== 'ADMIN') {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: 'ADMIN' },
      });
      console.log(`Elevated existing user to ADMIN (id=${existing.id})`);
    } else {
      console.log(`ADMIN user already exists (id=${existing.id})`);
    }
    return;
  }

  const userId = crypto.randomUUID();
  const accountId = crypto.randomUUID();
  const hashed = await hashPassword(password);
  const now = new Date();

  await prisma.$transaction([
    prisma.user.create({
      data: {
        id: userId,
        name,
        email,
        emailVerified: true,
        role: 'ADMIN',
        createdAt: now,
        updatedAt: now,
      },
    }),
    prisma.account.create({
      data: {
        id: accountId,
        accountId: userId,
        providerId: 'credential',
        userId,
        password: hashed,
        createdAt: now,
        updatedAt: now,
      },
    }),
  ]);

  console.log(`Created ADMIN user (id=${userId})`);
}

seed()
  .catch((error: unknown) => {
    console.error('Seed failed');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
