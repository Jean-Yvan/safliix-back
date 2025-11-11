import { Inject, Injectable, Logger } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { BaseQueryHandler } from '@safliix-back/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { GetAdViewsQuery } from '../../cqrs/queries/ad.queries';
import { AD_VIEW_REPOSITORY } from '../../../utils/ad.tokens';
import type { AdViewRepository } from '../../../domain/port/ad-view.repository';
import { AdView } from '../../../domain/entities/ad-view.entity';

@Injectable()
@QueryHandler(GetAdViewsQuery)
export class GetAdViewsHandler extends BaseQueryHandler<
  GetAdViewsQuery,
  Result<AdView[], Error>
> {
  protected override logger = new Logger(GetAdViewsHandler.name);

  constructor(
    @Inject(AD_VIEW_REPOSITORY)
    private readonly viewRepository: AdViewRepository,
  ) {
    super();
  }

  protected override async handle(
    query: GetAdViewsQuery,
  ): Promise<Result<AdView[], Error>> {
    const safe = await Result.safe(
      this.viewRepository.findByAd(query.adId),
    );
    if (safe.isErr()) {
      return Err(safe.unwrapErr());
    }

    return Ok(safe.unwrap());
  }
}
