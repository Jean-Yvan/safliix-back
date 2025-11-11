import { Inject, Injectable, Logger } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { BaseQueryHandler } from '@safliix-back/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { FindAdByIdQuery } from '../../cqrs/queries/ad.queries';
import { AD_REPOSITORY } from '../../../utils/ad.tokens';
import type { AdRepository } from '../../../domain/port/ad.repository';
import { Ad } from '../../../domain/entities/ad.entity';

@Injectable()
@QueryHandler(FindAdByIdQuery)
export class FindAdByIdHandler extends BaseQueryHandler<
  FindAdByIdQuery,
  Result<Ad, Error>
> {
  protected override logger = new Logger(FindAdByIdHandler.name);

  constructor(
    @Inject(AD_REPOSITORY) private readonly repository: AdRepository,
  ) {
    super();
  }

  protected override async handle(
    query: FindAdByIdQuery,
  ): Promise<Result<Ad, Error>> {
    const safe = await Result.safe(this.repository.findById(query.id));
    if (safe.isErr()) {
      return Err(safe.unwrapErr());
    }
    const ad = safe.unwrap();
    if (!ad) {
      return Err(new Error('Ad not found'));
    }
    return Ok(ad);
  }
}
