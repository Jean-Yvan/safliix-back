import { BaseHandler } from '@safliix-back/cqrs'
import { CommandHandler, EventBus } from '@nestjs/cqrs';
import { CreateSerieCommand } from '../cqrs/commands/add-serie.command';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { Result, Ok, Err } from 'oxide.ts'; 
import { SERIE_REPOSITORY } from '../../utils/types';
import type { ISerieRepository } from '../../domain/ports/serie.repository';
import { Serie } from '../../domain/entities/serie.entity';
@Injectable()
@CommandHandler(CreateSerieCommand)
export class CreateSerieHandler extends BaseHandler<CreateSerieCommand, Result<Serie, Error>> {
  protected override logger = new Logger(CreateSerieHandler.name);

  constructor(
    @Inject(SERIE_REPOSITORY)
    private readonly repository: ISerieRepository,
    eventBus: EventBus
  ) {
    super(eventBus);
  }

  protected override async handle(command: CreateSerieCommand): Promise<Result<Serie,Error>> {
    const serieResult = Serie.create(command.payload);
    if(serieResult.isErr()){
      this.logger.error(`Validation failed for serie: ${command.payload.title} ${serieResult.unwrapErr().message}`);
      return Err(new Error(serieResult.unwrapErr().message));
    }

    const serie = serieResult.unwrap();

    const saveResult = await Result.safe(this.repository.save(serie));
    if (saveResult.isErr()) {
      this.logger.error(`Failed to save serie ${command.payload.title}: ${saveResult.unwrapErr().message}`);
      return Err(new Error(saveResult.unwrapErr().message));
    }

    return Ok(saveResult.unwrap())

  }
}
  
