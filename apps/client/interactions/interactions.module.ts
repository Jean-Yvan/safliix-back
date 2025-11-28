import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SafliixBackContentsModule } from '@safliix-back/contents';
import { SafliixBackVideoTrackingModule } from '@safliix-back/videoTracking';
import { InteractionsController } from './interactions.controller';

@Module({
  imports: [CqrsModule, SafliixBackContentsModule, SafliixBackVideoTrackingModule],
  controllers: [InteractionsController],
})
export class InteractionsModule {}
