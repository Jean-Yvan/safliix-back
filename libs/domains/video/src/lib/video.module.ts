import { Module } from '@nestjs/common';
import { SafliixBackDatabaseModule } from '@safliix-back/database';
import { 
  CreateMediaHandler,
  RequestUploadHandler,
  ConfirmUploadHandler,
  AttachMediaToElmtHandler,
  UpdateMediaHandler,
  

  
} from './application';

import { MEDIA_REPOSITORY } from './utils/types';
import { PrismaMediaFileRepository } from './infrastructure/prisma-media-file.repository';
@Module({
  imports: [
    SafliixBackDatabaseModule
  ],
  providers: [
    {
      provide: MEDIA_REPOSITORY,
      useClass: PrismaMediaFileRepository
    },
    CreateMediaHandler,
    RequestUploadHandler,
    ConfirmUploadHandler,
    AttachMediaToElmtHandler,
    UpdateMediaHandler,
  ],
  exports: [
    CreateMediaHandler,
    RequestUploadHandler,
    ConfirmUploadHandler,
    AttachMediaToElmtHandler,
    UpdateMediaHandler,
  ],
})
export class SafliixBackMediaModule {}
