import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBody, ApiQuery } from '@nestjs/swagger';
import { VideoSplitterService } from './services/video-splitter.service';

@ApiTags('video')
@Controller('video')
export class VideoSplitterController {
  constructor(private readonly videoSplitterService: VideoSplitterService) {}

  @Post('split')
  @ApiQuery({
    name: 'inputFile',
    type: String,
    example: 'movie.mp4',
    description: 'Nom du fichier vidéo dans le bucket S3',
  })
  async splitVideo(@Query('inputFile') inputFile: string) {
    return this.videoSplitterService.processVideo({
      s3Key: inputFile, // juste le nom du fichier
      userId: 'test',
    });
  }

  @Get('analyze')
  @ApiQuery({ name: 'file', type: String, example: 'movie.mp4' })
  async analyzeVideo(@Query('file') inputFile: string) {
    // Simule le "download" en local
    const localPath = await this.videoSplitterService['downloadFromS3'](inputFile);
    return this.videoSplitterService['analyzeVideo'](localPath);
  }
}
