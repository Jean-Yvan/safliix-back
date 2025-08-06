export * from './lib/database.module';

// eslint-disable-next-line @nx/enforce-module-boundaries
export { Prisma,PrismaClient } from './generated/client';
export { PrismaService } from './lib/prisma.service';

