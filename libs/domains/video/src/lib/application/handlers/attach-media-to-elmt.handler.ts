import { CommandHandler } from "@nestjs/cqrs";
import { BaseHandler } from "@safliix-back/cqrs";
import { AttachMediaToElmtCommand } from "../cqrs/command/attach-media-to-elmt.command";
import { MediaFile } from "../../domain/entities/media-file.entity";
import { MEDIA_REPOSITORY } from "../../utils/types";
import type { MediaFileRepository } from "../../domain/ports/media-file.repository";
import { Result, Ok, Err } from "oxide.ts";
import { Injectable,Inject } from "@nestjs/common";

@CommandHandler(AttachMediaToElmtCommand)
@Injectable()
export class AttachMediaToElmtHandler extends BaseHandler<AttachMediaToElmtCommand, Result<MediaFile,Error>> {
  
  constructor(
    @Inject(MEDIA_REPOSITORY)
    private readonly repository: MediaFileRepository) {
    super();
  }

  protected override async handle(
  command: AttachMediaToElmtCommand
): Promise<Result<MediaFile, Error>> {
  const { mediaFileId, elementId, elementType, type } = command.payload;

  // 1️⃣ Récupérer le MediaFile
  const mediaFile = await this.repository.findById(mediaFileId);
  if (!mediaFile) {
    return Err(new Error(`MediaFile with id ${mediaFileId} not found`));
  }

  // 2️⃣ Attacher l'élément en utilisant Result.safe pour capturer les erreurs
  const attachResult = await Result.safe(
    this.repository.attachToElement(mediaFileId, elementType, elementId, type)
  );

  if (attachResult.isErr()) {
    return Err(attachResult.unwrapErr());
  }

  // 3️⃣ Retourner le MediaFile existant (ou mis à jour si repository retourne l'entité)
  return Ok(mediaFile);
}


    
  
  
}