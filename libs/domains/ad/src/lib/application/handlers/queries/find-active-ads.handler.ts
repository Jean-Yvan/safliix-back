import { Inject, Injectable, Logger } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { BaseQueryHandler } from '@safliix-back/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { FindActiveAdsQuery } from '../../cqrs/queries/ad.queries';
import { AD_REPOSITORY } from '../../../utils/ad.tokens';
import type { AdRepository } from '../../../domain/port/ad.repository';
import { Ad } from '../../../domain/entities/ad.entity';

@Injectable()
@QueryHandler(FindActiveAdsQuery)
export class FindActiveAdsHandler extends BaseQueryHandler<
  FindActiveAdsQuery,
  Result<Ad[], Error>
> {
  protected override logger = new Logger(FindActiveAdsHandler.name);

  constructor(
    @Inject(AD_REPOSITORY) private readonly repository: AdRepository,
  ) {
    super();
  }

  protected override async handle(
    query: FindActiveAdsQuery,
  ): Promise<Result<Ad[], Error>> {
    const safe = await Result.safe(
      this.repository.findActive(query.referenceDate),
    );

    if (safe.isErr()) {
      return Err(safe.unwrapErr());
    }
    return Ok(safe.unwrap());
  }
}
