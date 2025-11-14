import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SafliixBackAdModule } from '@safliix-back/ad';
import { AdsController } from './ads.controller';

@Module({
  imports: [CqrsModule, SafliixBackAdModule],
  controllers: [AdsController],
})
export class AdsModule {}
