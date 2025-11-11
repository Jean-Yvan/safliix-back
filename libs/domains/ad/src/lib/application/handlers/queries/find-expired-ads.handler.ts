import { Inject, Injectable, Logger } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { BaseQueryHandler } from '@safliix-back/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { FindExpiredAdsQuery } from '../../cqrs/queries/ad.queries';
import { AD_REPOSITORY } from '../../../utils/ad.tokens';
import type { AdRepository } from '../../../domain/port/ad.repository';
import { Ad } from '../../../domain/entities/ad.entity';

@Injectable()
@QueryHandler(FindExpiredAdsQuery)
export class FindExpiredAdsHandler extends BaseQueryHandler<
  FindExpiredAdsQuery,
  Result<Ad[], Error>
> {
  protected override logger = new Logger(FindExpiredAdsHandler.name);

  constructor(
    @Inject(AD_REPOSITORY) private readonly repository: AdRepository,
  ) {
    super();
  }

  protected override async handle(
    query: FindExpiredAdsQuery,
  ): Promise<Result<Ad[], Error>> {
    const safe = await Result.safe(
      this.repository.findExpired(query.referenceDate),
    );
    if (safe.isErr()) {
      return Err(safe.unwrapErr());
    }

    return Ok(safe.unwrap());
  }
}
