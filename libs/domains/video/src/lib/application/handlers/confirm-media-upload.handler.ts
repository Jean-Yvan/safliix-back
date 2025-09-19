import { CommandHandler } from "@nestjs/cqrs";
import { BaseHandler } from "@safliix-back/cqrs";
import { ConfirmUploadCommand } from "../cqrs/command/confirm-media-upload.command";
import { MediaFile } from "../../domain/entities/media-file.entity";
import { MEDIA_REPOSITORY } from "../../utils/types";
import type { MediaFileRepository } from "../../domain/ports/media-file.repository";
import { Result, Ok, Err } from "oxide.ts";
import { Injectable, Inject } from "@nestjs/common";
import { MediaFileStatus } from "@safliix-back/database";
@CommandHandler(ConfirmUploadCommand)
@Injectable()
export class ConfirmUploadHandler extends BaseHandler<ConfirmUploadCommand, Result<MediaFile, Error>> {
  
  constructor(
    @Inject(MEDIA_REPOSITORY)
    private readonly repository: MediaFileRepository
  ) {
    super();
  }

  protected override async handle(command: ConfirmUploadCommand): Promise<Result<MediaFile, Error>> {
    const { mediaFileId } = command.dto;

    // 1️⃣ Récupérer le MediaFile
    const mediaFile = await this.repository.findById(mediaFileId);
    if (!mediaFile) {
      return Err(new Error(`MediaFile with id ${mediaFileId} not found`));
    }

    // 2️⃣ Mettre à jour le status
    const updateResult = await Result.safe(this.repository.updateStatus(mediaFileId, MediaFileStatus.UPLOADED));
    if (updateResult.isErr()) {
      return Err(updateResult.unwrapErr());
    }

    return Ok(mediaFile);
  }
}
