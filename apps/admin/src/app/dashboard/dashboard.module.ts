import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SafliixBackMetricDomainModule } from '@safliix-back/metric';
import { SafliixBackDatabaseModule } from '@safliix-back/database';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [SafliixBackMetricDomainModule, SafliixBackDatabaseModule, CqrsModule],
  controllers: [DashboardController],
})
export class DashboardModule {}
