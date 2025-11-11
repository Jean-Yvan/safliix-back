import { Inject, Injectable, Logger } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { BaseQueryHandler } from '@safliix-back/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { GetAdViewsCountQuery } from '../../cqrs/queries/ad.queries';
import { AD_VIEW_REPOSITORY } from '../../../utils/ad.tokens';
import type { AdViewRepository } from '../../../domain/port/ad-view.repository';

@Injectable()
@QueryHandler(GetAdViewsCountQuery)
export class GetAdViewsCountHandler extends BaseQueryHandler<
  GetAdViewsCountQuery,
  Result<number, Error>
> {
  protected override logger = new Logger(GetAdViewsCountHandler.name);

  constructor(
    @Inject(AD_VIEW_REPOSITORY)
    private readonly viewRepository: AdViewRepository,
  ) {
    super();
  }

  protected override async handle(
    query: GetAdViewsCountQuery,
  ): Promise<Result<number, Error>> {
    const safe = await Result.safe(
      this.viewRepository.countByAd(query.adId),
    );

    if (safe.isErr()) {
      return Err(safe.unwrapErr());
    }

    return Ok(safe.unwrap());
  }
}
