import { Module } from '@nestjs/common';
import { SafliixBackBullmqModule } from '@safliix-back/bullmq';
import { VideoIngestController } from './ffmpeg.controller';
import { VideoSplitterService } from './services/video-splitter.service';
import { FfmpegService } from './services/ffmpeg.service';
import { VideoEncodingService } from './services/video-encoding.service';
import { VideoEncodingWorker } from './workers/video-encoding.worker';
import { ConfigModule } from '@nestjs/config';
import { RedisManager } from './services/redis-manager';
import { TaskProgressCoordinator } from './services/task-progess-coordinator.service';
import { PlaylistAssemblerService } from './services/playlist-assembler.service';
import { VideoEventDispatcher } from './services/video-event-dispatcher.service';
import { VideoSegmentCoordinator } from './services/video-segment-coordinator.service';
import { PlaylistAssemblerWorker } from './workers/playlist-assembler.worker';
import { UploaderWorker } from './workers/upload-file.worker';
import { VideoSplitterWorker } from './workers/video-splitter.worker';
import { IngestWorker } from './workers/video-ingest.worker';
import { VideoEventWorker } from './workers/video-event.worker';
@Module({
  imports: [
    SafliixBackBullmqModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [VideoIngestController],
  
  providers: [
    VideoSplitterService,
    FfmpegService,
    VideoSplitterService,
    VideoEncodingService,
    PlaylistAssemblerService,
    VideoEventDispatcher,
    VideoSegmentCoordinator,
    
    RedisManager,
    TaskProgressCoordinator,
    PlaylistAssemblerWorker,
    UploaderWorker,
    VideoEncodingWorker,
    VideoSplitterWorker,
    IngestWorker,
    VideoEventWorker
  ],
})
export class AppModule {}
