import { Module } from '@nestjs/common';
import { VideoProcessor } from './video-processor.service';
import { SafliixBackBullmqModule } from '@safliix-back/bullmq';

@Module({
  imports: [
    SafliixBackBullmqModule.forRoot(),
        
  ],
  
  providers: [VideoProcessor],
})
export class AppModule {}
