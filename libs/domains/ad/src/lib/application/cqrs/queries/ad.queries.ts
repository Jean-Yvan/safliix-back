import { IQuery } from '@nestjs/cqrs';
import { AdFilter } from '../../../domain/types/ad-filter.type';
import { AdStatisticsOptions } from '../../../domain/types/ad-statistics-options.type';

export class FindAdByIdQuery implements IQuery {
  constructor(public readonly id: string) {}
}

export class FindAllAdsQuery implements IQuery {
  constructor(public readonly filters?: AdFilter) {}
}

export class FindActiveAdsQuery implements IQuery {
  constructor(public readonly referenceDate: Date = new Date()) {}
}

export class FindExpiredAdsQuery implements IQuery {
  constructor(public readonly referenceDate: Date = new Date()) {}
}

export class GetAdStatisticsQuery implements IQuery {
  constructor(
    public readonly adId: string,
    public readonly options?: AdStatisticsOptions,
  ) {}
}

export class GetAdViewsQuery implements IQuery {
  constructor(public readonly adId: string) {}
}

export class GetAdViewsCountQuery implements IQuery {
  constructor(public readonly adId: string) {}
}
