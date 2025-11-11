import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { BaseHandler } from '@safliix-back/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { DeleteAdCommand } from '../../cqrs/commands/ad.commands';
import { AD_REPOSITORY } from '../../../utils/ad.tokens';
import type { AdRepository } from '../../../domain/port/ad.repository';

@Injectable()
@CommandHandler(DeleteAdCommand)
export class DeleteAdHandler extends BaseHandler<
  DeleteAdCommand,
  Result<void, Error>
> {
  constructor(
    @Inject(AD_REPOSITORY) private readonly repository: AdRepository,
  ) {
    super();
  }

  protected override async handle(
    command: DeleteAdCommand,
  ): Promise<Result<void, Error>> {
    const existingResult = await Result.safe(
      this.repository.findById(command.id),
    );
    if (existingResult.isErr()) {
      return Err(existingResult.unwrapErr());
    }

    if (!existingResult.unwrap()) {
      return Err(new Error('Ad not found'));
    }

    const safe = await Result.safe(this.repository.delete(command.id));
    if (safe.isErr()) {
      return Err(safe.unwrapErr());
    }

    return Ok(undefined);
  }
}
