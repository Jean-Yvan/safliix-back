import { CommandHandler } from "@nestjs/cqrs";
import { BaseHandler } from "@safliix-back/cqrs";
import { CreateMediaFileCommand } from "../cqrs/command/create-media.command";
import { MediaFile } from "../../domain/entities/media-file.entity";
import { MEDIA_REPOSITORY } from "../../utils/types";
import type { MediaFileRepository } from "../../domain/ports/media-file.repository";
import { Result, Ok, Err } from "oxide.ts";
import { Injectable,Inject } from "@nestjs/common";

@CommandHandler(CreateMediaFileCommand)
@Injectable()
export class CreateMediaHandler extends BaseHandler<CreateMediaFileCommand, Result<MediaFile,Error>> {
  
  constructor(
    @Inject(MEDIA_REPOSITORY)
    private readonly repository: MediaFileRepository) {
    super();
  }

  protected override async handle(command: CreateMediaFileCommand): Promise<Result<MediaFile, Error>> {

    const created = MediaFile.create(
      undefined,
      command.payload.s3Key,
      command.payload.duration ?? 0,
      command.payload.width ?? 0,
      command.payload.height ?? 0,
    );

    if (created.isErr()) {
      return Err(created.unwrapErr());
    }
    const result = await Result.safe(this.repository.save(created.unwrap()));

    if (result.isErr()) {
      return Err(result.unwrapErr());
    }

    return Ok(created.unwrap());
  }
  
}