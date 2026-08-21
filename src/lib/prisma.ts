import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function getDbUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

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
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
