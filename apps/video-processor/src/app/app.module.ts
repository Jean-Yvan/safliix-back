import { Module } from '@nestjs/common';
import { VideoProcessor } from './video-processor.service';
import { SafliixBackBullmqModule } from '@safliix-back/bullmq';
import { VideoSplitterController } from './ffmpeg.controller';
import { VideoSplitterService } from './services/video-splitter.service';
import { FfmpegService } from './services/ffmpeg.service';
import { VideoEncodingService } from './services/video-encoding.service';
import { VideoEncodingProcessor } from './workers/video-encoding.worker';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    SafliixBackBullmqModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [VideoSplitterController],
  
  providers: [
    VideoProcessor,
    VideoSplitterService,
    FfmpegService,
    VideoSplitterService,
    VideoEncodingService,
    VideoEncodingProcessor
  ],
})
export class AppModule {}
