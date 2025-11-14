export * from './lib/ad.module';

export {
  CreateAdCommand,
  UpdateAdCommand,
  DeleteAdCommand,
  ActivateAdCommand,
  DeactivateAdCommand,
  TrackAdViewCommand,
} from './lib/application/cqrs/commands/ad.commands';

export {
  FindAdByIdQuery,
  FindAllAdsQuery,
  FindActiveAdsQuery,
  FindExpiredAdsQuery,
  GetAdStatisticsQuery,
  GetAdViewsQuery,
  GetAdViewsCountQuery,
} from './lib/application/cqrs/queries/ad.queries';

export * from './lib/application/handlers/commands';
export * from './lib/application/handlers/queries';

export { Ad } from './lib/domain/entities/ad.entity';
export { AdView } from './lib/domain/entities/ad-view.entity';

export { CreateAdDto } from './lib/interfaces/dto/create-ad.dto';
export { UpdateAdDto } from './lib/interfaces/dto/update-ad.dto';
export { CreateAdViewDto } from './lib/interfaces/dto/create-ad-view.dto';
export { AdFilterDto } from './lib/interfaces/dto/ad-filter.dto';

export { AD_REPOSITORY, AD_VIEW_REPOSITORY } from './lib/utils/ad.tokens';
export type { AdFilter } from './lib/domain/types/ad-filter.type';
export type { AdStatisticsOptions } from './lib/domain/types/ad-statistics-options.type';
export type { AdStatistics } from './lib/domain/port/ad-view.repository';
export type { AdAttachmentPrimitives } from './lib/domain/types/ad-attachment.type';
