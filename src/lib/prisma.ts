import { PrismaClient } from '@prisma/client';
import path from 'path';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const dbUrl = process.env.DATABASE_URL || `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
