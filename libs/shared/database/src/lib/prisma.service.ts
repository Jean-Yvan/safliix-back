import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from './generated/client';
@Injectable()
export class PrismaService implements OnModuleInit {
  private readonly prisma = new PrismaClient();

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }

  // expose les méthodes nécessaires
  get client() {
    return this.prisma;
  }
}
