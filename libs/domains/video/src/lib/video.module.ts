import { Module } from '@nestjs/common';
import { SafliixBackDatabaseModule } from '@safliix-back/database';
import { 
  CreateVideoHandler,
  RequestUploadHandler,
  ConfirmUploadHandler,
  AttachVideoToElmtHandler,
  UpdateVideoHandler,
  

  
} from './application';

import { VIDEO_REPOSITORY } from './utils/types';
import { PrismaVideoFileRepository } from './infrastructure/prisma-video-file.repository';
@Module({
  imports: [
    SafliixBackDatabaseModule
  ],
  providers: [
    {
      provide: VIDEO_REPOSITORY,
      useClass: PrismaVideoFileRepository
    },
    CreateVideoHandler,
    RequestUploadHandler,
    ConfirmUploadHandler,
    AttachVideoToElmtHandler,
    UpdateVideoHandler,
  ],
  exports: [
    CreateVideoHandler,
    RequestUploadHandler,
    ConfirmUploadHandler,
    AttachVideoToElmtHandler,
    UpdateVideoHandler,
  ],
})
export class SafliixBackVideoModule {}
