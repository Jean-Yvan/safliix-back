import { BaseHandler } from '@safliix-back/cqrs'
import { CommandHandler } from '@nestjs/cqrs';
import { CreateSerieCommand } from '../cqrs/commands/add-serie.command';
import { Injectable, Inject } from '@nestjs/common';
import { Result, Ok, Err } from 'oxide.ts'; 
import { SERIE_REPOSITORY } from '../../utils/types';
import type { ISerieRepository } from '../../domain/ports/serie.repository';
import { Serie } from '../../domain/entities/serie.entity';

@Injectable()
@CommandHandler(CreateSerieCommand)
export class CreateSerieHandler extends BaseHandler<CreateSerieCommand, Result<void, Error>> {
  //protected override logger = new Logger(CreateSerieHandler.name);

  constructor(
    @Inject(SERIE_REPOSITORY)
    private readonly repository: ISerieRepository,
  ) {
    super();
  }

  protected override async handle(command: CreateSerieCommand): Promise<Result<void,Error>> {
    const serieResult = Serie.create(command.payload);
    if(serieResult.isErr()){
      //this.logger.error(`Validation failed for serie: ${command.payload.title} ${serieResult.unwrapErr().message}`);
      console.log("error:une erreur s'est déclenchée");
      return Err(serieResult.unwrapErr());
    }

    const serie = serieResult.unwrap();

    const saveResult = await Result.safe(this.repository.save(serie));
    if (saveResult.isErr()) {
      //this.logger.error(`Failed to save serie ${command.payload.title}: ${saveResult.unwrapErr().message}`);
      return Err(saveResult.unwrapErr());
    }

    return Ok(undefined)

  }
}
  
