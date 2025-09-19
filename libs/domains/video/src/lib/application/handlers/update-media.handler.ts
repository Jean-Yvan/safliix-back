import { CommandHandler } from "@nestjs/cqrs";
import { BaseHandler } from "@safliix-back/cqrs";
import { UpdateMediaFileCommand } from "../cqrs/command/update-media.command";
import { MEDIA_REPOSITORY } from "../../utils/types";
import type { MediaFileRepository } from "../../domain/ports/media-file.repository";
import { Result, Ok, Err } from "oxide.ts";
import { Injectable,Inject } from "@nestjs/common";

@CommandHandler(UpdateMediaFileCommand)
@Injectable()
export class UpdateMediaHandler extends BaseHandler<UpdateMediaFileCommand, Result<void,Error>> {
  
  constructor(
    @Inject(MEDIA_REPOSITORY)
    private readonly repository: MediaFileRepository) {
    super();
  }

  protected override async handle(command: UpdateMediaFileCommand): Promise<Result<void, Error>> {

   const existingRes = await Result.safe(this.repository.findById(command.payload.id));

    if (existingRes.isErr()) {
      return Err(existingRes.unwrapErr());
    }   

    const existing = existingRes.unwrap();

    if (!existing) {
      return Err(new Error('Media file not found'));
    }
    
    existing.updateWith(command.payload);
    const result = await Result.safe(this.repository.update(existing));

    if (result.isErr()) {
      return Err(result.unwrapErr());
    }

    return Ok(result.unwrap());
  }
  
}