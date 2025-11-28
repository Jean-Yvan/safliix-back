import { CommandHandler } from "@nestjs/cqrs";
//import { BaseHandler } from "@safliix-back/cqrs";
import { RequestUploadCommand } from "../cqrs/command/request-media-upload.command";
//import { MEDIA_REPOSITORY } from "../../utils/types";
//import type { MediaFileRepository } from "../../domain/ports/media-file.repository";
//import { Result } from "oxide.ts";
import { Injectable,  } from "@nestjs/common";

@CommandHandler(RequestUploadCommand)
@Injectable()
export class RequestUploadHandler /* extends BaseHandler<RequestUploadCommand, Result<{ videoFileId: string; signedUrl: string }, Error>> */ {
  
  constructor(
    /* @Inject(MEDIA_REPOSITORY)
    private readonly repository: MediaFileRepository */
  ) {
    //super();
  }
  
  /* protected override async handle(
  command: RequestUploadCommand
): Promise<
  Result<
    { mediaFiles: { mediaFileId: string; signedUrl: string }[] },
    Error
  >
> {
  const { elementId, files } = command.dto;

  const results: { mediaFileId: string; signedUrl: string }[] = [];

  for (const file of files) {
    // 1️⃣ Créer un MediaFile
    const createdResult = MediaFile.create(
      file.fileName,
      file.mimeType,
      file.mediaType,       // VIDEO / AUDIO / IMAGE
      file.attachmentType,  // MAIN / TRAILER / BONUS...
      elementId
    );

    if (createdResult.isErr()) {
      return Err(createdResult.unwrapErr());
    }
    const mediaFile = createdResult.unwrap();

    // 2️⃣ Sauvegarder
    const saveResult = await Result.safe(this.repository.save(mediaFile));
    if (saveResult.isErr()) {
      return Err(saveResult.unwrapErr());
    }

    // 3️⃣ Générer URL signé
    if (!mediaFile.id) {
      return Err(new Error("MediaFile id is undefined"));
    }
    const signedUrl = await this.repository.generateSignedUrl(mediaFile.id);

    results.push({
      mediaFileId: mediaFile.id,
      signedUrl,
    });
  }

  return Ok({ mediaFiles: results });
} */
  /* protected override async handle(command: RequestUploadCommand): Promise<Result<{ videoFileId: string; signedUrl: string }, Error>> {
    throw new Error('Method not implemented.');
  } */
 
}
