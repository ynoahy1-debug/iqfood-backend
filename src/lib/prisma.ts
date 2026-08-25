import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function getDbUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  // On Vercel / serverless Linux environments, root filesystem is read-only.
  // We copy the bundled SQLite database to /tmp/dev.db so write/insert operations succeed.
  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

  if (isServerless) {
    const tmpDbPath = path.join('/tmp', 'dev.db');
    const sourceDbPath = path.join(process.cwd(), 'prisma', 'dev.db');

    if (!fs.existsSync(tmpDbPath)) {
      if (fs.existsSync(sourceDbPath)) {
        try {
          fs.copyFileSync(sourceDbPath, tmpDbPath);
        } catch (e) {
          console.error('Failed to copy db to /tmp:', e);
        }
      }
    }
    return `file:${tmpDbPath}`;
  }

  const cwdDb = path.join(process.cwd(), 'prisma', 'dev.db');
  if (fs.existsSync(cwdDb)) {
    return `file:${cwdDb}`;
  }
  return 'file:./prisma/dev.db';
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: getDbUrl(),
      },
    },
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
