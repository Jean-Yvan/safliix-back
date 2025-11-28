import { Module } from '@nestjs/common';
import { SafliixBackDatabaseModule } from '@safliix-back/database';
import { UploadsController } from './uploads.controller';
import { SafliixBackS3Module } from '@safliix-back/s3';

@Module({
  imports: [SafliixBackDatabaseModule, SafliixBackS3Module],
  controllers: [UploadsController],
})
export class UploadsModule {}
