import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { BaseHandler } from '@safliix-back/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { TrackAdViewCommand } from '../../cqrs/commands/ad.commands';
import { AD_REPOSITORY, AD_VIEW_REPOSITORY } from '../../../utils/ad.tokens';
import type { AdRepository } from '../../../domain/port/ad.repository';
import type { AdViewRepository } from '../../../domain/port/ad-view.repository';
import { AdView } from '../../../domain/entities/ad-view.entity';

@Injectable()
@CommandHandler(TrackAdViewCommand)
export class TrackAdViewHandler extends BaseHandler<
  TrackAdViewCommand,
  Result<void, Error>
> {
  constructor(
    @Inject(AD_REPOSITORY) private readonly adRepository: AdRepository,
    @Inject(AD_VIEW_REPOSITORY)
    private readonly adViewRepository: AdViewRepository,
  ) {
    super();
  }

  protected override async handle(
    command: TrackAdViewCommand,
  ): Promise<Result<void, Error>> {
    const adResult = await Result.safe(
      this.adRepository.findById(command.payload.adId),
    );
    if (adResult.isErr()) {
      return Err(adResult.unwrapErr());
    }
    if (!adResult.unwrap()) {
      return Err(new Error('Ad not found'));
    }

    const adViewResult = AdView.create(command.payload);
    if (adViewResult.isErr()) {
      return Err(adViewResult.unwrapErr());
    }

    const safe = await Result.safe(
      this.adViewRepository.create(adViewResult.unwrap()),
    );

    if (safe.isErr()) {
      return Err(safe.unwrapErr());
    }

    return Ok(undefined);
  }
}
