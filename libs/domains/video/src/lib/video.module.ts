import { Module } from '@nestjs/common';
import { SafliixBackDatabaseModule } from '@safliix-back/database';
import { 
  CreateMediaHandler,
  RequestUploadHandler,
  ConfirmUploadHandler,
  AttachMediaToElmtHandler,
  UpdateMediaHandler,
  

  
} from './application';

import { ACTIVE_STREAM_REPOSITORY, MEDIA_REPOSITORY } from './utils/types';
import { PrismaMediaFileRepository } from './infrastructure/prisma-media-file.repository';
import { PrismaActiveStreamRepository } from './infrastructure/prisma-active-stream.repository';
import { ActiveStreamService } from './services/active-stream.service';
@Module({
  imports: [
    SafliixBackDatabaseModule
  ],
  providers: [
    {
      provide: MEDIA_REPOSITORY,
      useClass: PrismaMediaFileRepository
    },
    {
      provide: ACTIVE_STREAM_REPOSITORY,
      useClass: PrismaActiveStreamRepository,
    },
    ActiveStreamService,
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
    ActiveStreamService,
  ],
})
export class SafliixBackMediaModule {}
