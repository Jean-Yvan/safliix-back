import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SafliixBackContentsModule } from '@safliix-back/contents';
import { ContentController } from './content.controller';

@Module({
  imports: [CqrsModule, SafliixBackContentsModule],
  controllers: [ContentController],
})
export class ContentModule {}
