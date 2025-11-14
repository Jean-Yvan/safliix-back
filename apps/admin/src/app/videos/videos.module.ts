import { Module } from '@nestjs/common';
import { VideosController } from './videos.controller';
import { SafliixBackMediaModule } from '@safliix-back/video';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  controllers:[VideosController],
  imports:[
    CqrsModule.forRoot(),
    SafliixBackMediaModule
  ]
})
export class VideosModule {}
