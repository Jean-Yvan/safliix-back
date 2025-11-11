import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { BaseHandler } from '@safliix-back/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { DeactivateAdCommand } from '../../cqrs/commands/ad.commands';
import { AD_REPOSITORY } from '../../../utils/ad.tokens';
import type { AdRepository } from '../../../domain/port/ad.repository';

@Injectable()
@CommandHandler(DeactivateAdCommand)
export class DeactivateAdHandler extends BaseHandler<
  DeactivateAdCommand,
  Result<void, Error>
> {
  constructor(
    @Inject(AD_REPOSITORY) private readonly repository: AdRepository,
  ) {
    super();
  }

  protected override async handle(
    command: DeactivateAdCommand,
  ): Promise<Result<void, Error>> {
    const existingResult = await Result.safe(
      this.repository.findById(command.id),
    );

    if (existingResult.isErr()) {
      return Err(existingResult.unwrapErr());
    }
    const existing = existingResult.unwrap();
    if (!existing) {
      return Err(new Error('Ad not found'));
    }

    const safe = await Result.safe(
      this.repository.save(existing.deactivate()),
    );
    if (safe.isErr()) {
      return Err(safe.unwrapErr());
    }

    return Ok(undefined);
  }
}
