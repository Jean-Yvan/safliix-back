// libs/shared/bullmq/src/lib/bullmq.module.ts
import { Module, Global } from '@nestjs/common';
import { BullMQService } from './services/bullmq.service';
import { ConfigModule } from '@nestjs/config';
@Global() // pour que BullMQService soit injectable partout
@Module({
   imports: [ConfigModule],
  providers: [BullMQService],
  exports: [BullMQService],
})
export class SafliixBackBullmqModule {}
