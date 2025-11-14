import { Inject, Injectable, Logger } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { BaseQueryHandler } from '@safliix-back/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { GetAdStatisticsQuery } from '../../cqrs/queries/ad.queries';
import {
  AD_REPOSITORY,
  AD_VIEW_REPOSITORY,
} from '../../../utils/ad.tokens';
import type { AdRepository } from '../../../domain/port/ad.repository';
import type {
  AdStatistics,
  AdViewRepository,
} from '../../../domain/port/ad-view.repository';

@Injectable()
@QueryHandler(GetAdStatisticsQuery)
export class GetAdStatisticsHandler extends BaseQueryHandler<
  GetAdStatisticsQuery,
  Result<AdStatistics, Error>
> {
  protected override logger = new Logger(GetAdStatisticsHandler.name);

  constructor(
    @Inject(AD_REPOSITORY) private readonly adRepository: AdRepository,
    @Inject(AD_VIEW_REPOSITORY)
    private readonly viewRepository: AdViewRepository,
  ) {
    super();
  }

  protected override async handle(
    query: GetAdStatisticsQuery,
  ): Promise<Result<AdStatistics, Error>> {
    const adResult = await Result.safe(
      this.adRepository.findById(query.adId),
    );
    if (adResult.isErr()) {
      return Err(adResult.unwrapErr());
    }
    if (!adResult.unwrap()) {
      return Err(new Error('Ad not found'));
    }

    const range = query.options?.range;

    const totalsResult = await Result.safe(
      this.viewRepository.countByAd(query.adId, range),
    );
    if (totalsResult.isErr()) {
      return Err(totalsResult.unwrapErr());
    }

    const uniquesResult = await Result.safe(
      this.viewRepository.uniqueViewersCount(query.adId, range),
    );
    if (uniquesResult.isErr()) {
      return Err(uniquesResult.unwrapErr());
    }

    const byCountryResult = await Result.safe(
      this.viewRepository.viewsByCountry(query.adId, range),
    );
    if (byCountryResult.isErr()) {
      return Err(byCountryResult.unwrapErr());
    }

    const byDateResult = await Result.safe(
      this.viewRepository.viewsByDate(query.adId, range),
    );
    if (byDateResult.isErr()) {
      return Err(byDateResult.unwrapErr());
    }

    return Ok({
      adId: query.adId,
      totalViews: totalsResult.unwrap(),
      uniqueViewers: uniquesResult.unwrap(),
      viewsByCountry: byCountryResult.unwrap(),
      viewsByDate: byDateResult.unwrap(),
    });
  }
}
