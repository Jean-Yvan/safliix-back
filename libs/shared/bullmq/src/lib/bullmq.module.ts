// libs/shared/bullmq/src/lib/bullmq.module.ts
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { BullmqProducerService } from './bullmq.producer.service';
import { Queues } from './queue';
@Module({})
export class SafliixBackBullmqModule {
  static forRoot(): DynamicModule {
    return {
      module: SafliixBackBullmqModule,
      imports: [
        ConfigModule,
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
              removeOnComplete: true,
              removeOnFail: false,
            },
          }),
          inject: [ConfigService],
        }),

        // 👉 ici on enregistre explicitement la queue
        BullModule.registerQueue({
          name: Queues.VIDEO_PROCESSING,
        }),
      ],
      providers: [BullmqProducerService],
      exports: [BullModule, BullmqProducerService],
    };
  }
}
