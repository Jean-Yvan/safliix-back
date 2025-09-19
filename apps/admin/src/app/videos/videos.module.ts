import { Module } from '@nestjs/common';
import { VideosController } from './videos.controller';
import { SafliixBackVideoModule } from '@safliix-back/video';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  controllers:[VideosController],
  imports:[
    CqrsModule.forRoot(),
    SafliixBackVideoModule
  ]
})
export class VideosModule {}
