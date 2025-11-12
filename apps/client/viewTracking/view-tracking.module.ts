import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SafliixBackVideoTrackingModule } from '@safliix-back/videoTracking';
import { ClientViewTrackingController } from './view-tracking.controller';

@Module({
  imports: [CqrsModule, SafliixBackVideoTrackingModule],
  controllers: [ClientViewTrackingController],
})
export class ViewTrackingModule {}
