// libs/shared/bullmq/src/lib/bullmq.module.ts
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

@Module({})
export class SafliixBackBullmqModule {
  static forRoot(): DynamicModule {
    return {
      module: SafliixBackBullmqModule,
      imports: [
        BullModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            connection: {
              host: configService.get('REDIS_HOST', 'localhost'),
              port: configService.get('REDIS_PORT', 6379),
            },
            defaultJobOptions: {
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 1000,
              },
            },
          }),
          inject: [ConfigService],
        }),
      ],
      exports: [BullModule],
    };
  }
}
