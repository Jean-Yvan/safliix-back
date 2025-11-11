import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { BaseHandler } from '@safliix-back/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { CreateAdCommand } from '../../cqrs/commands/ad.commands';
import { Ad } from '../../../domain/entities/ad.entity';
import type { AdRepository } from '../../../domain/port/ad.repository';
import { AD_REPOSITORY } from '../../../utils/ad.tokens';

@Injectable()
@CommandHandler(CreateAdCommand)
export class CreateAdHandler extends BaseHandler<
  CreateAdCommand,
  Result<Ad, Error>
> {
  constructor(
    @Inject(AD_REPOSITORY) private readonly repository: AdRepository,
  ) {
    super();
  }

  protected override async handle(
    command: CreateAdCommand,
  ): Promise<Result<Ad, Error>> {
    const adResult = Ad.create(command.payload);
    if (adResult.isErr()) {
      return Err(adResult.unwrapErr());
    }

    const safe = await Result.safe(
      this.repository.create(adResult.unwrap()),
    );

    if (safe.isErr()) {
      return Err(safe.unwrapErr());
    }

    return Ok(safe.unwrap());
  }
}
