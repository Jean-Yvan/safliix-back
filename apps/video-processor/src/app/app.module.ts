import { Module } from '@nestjs/common';
import { VideoProcessor } from './video-processor.service';
import { SafliixBackBullmqModule } from '@safliix-back/bullmq';
import { VideoSplitterController } from './ffmpeg.controller';
import { VideoSplitterService } from './services/video-splitter.service';

@Module({
  imports: [SafliixBackBullmqModule],
  controllers: [VideoSplitterController],
  
  providers: [VideoProcessor,VideoSplitterService],
})
export class AppModule {}
