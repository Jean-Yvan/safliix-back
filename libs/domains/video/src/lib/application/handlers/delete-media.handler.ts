import { CommandHandler } from "@nestjs/cqrs";
import { BaseHandler } from "@safliix-back/cqrs";
import { DeleteMediaFileCommand } from "../cqrs/command/delete-media.command";
import { MEDIA_REPOSITORY } from "../../utils/types";
import type { MediaFileRepository } from "../../domain/ports/media-file.repository";
import { Result, Ok, Err } from "oxide.ts";
import { Injectable,Inject } from "@nestjs/common";

@CommandHandler(DeleteMediaFileCommand)
@Injectable()
export class DeleteMediaHandler extends BaseHandler<DeleteMediaFileCommand, Result<void,Error>> {
  
  constructor(
    @Inject(MEDIA_REPOSITORY)
    private readonly repository: MediaFileRepository) {
    super();
  }

  protected override async handle(
  command: DeleteMediaFileCommand
): Promise<Result<void, Error>> {

    const existingRes = await Result.safe(this.repository.findById(command.id));

    if (existingRes.isErr()) {
      return Err(existingRes.unwrapErr());
    }   

    const existing = existingRes.unwrap();

    if (!existing) {
      return Err(new Error('Media file not found'));
    }
    
    const result = await Result.safe(this.repository.delete(command.id));
    if (result.isErr()) {
      return Err(result.unwrapErr());
    }

    return Ok(result.unwrap());

  }
  
}


    
  
  
