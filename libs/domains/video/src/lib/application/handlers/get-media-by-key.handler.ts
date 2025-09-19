import { QueryHandler } from "@nestjs/cqrs";
import { BaseQueryHandler } from "@safliix-back/cqrs";
import { GetMediaFileByKeyQuery } from "../cqrs/queries/get-media-by-key.query";
import { MediaFile } from "../../domain/entities/media-file.entity";
import { MEDIA_REPOSITORY } from "../../utils/types";
import type { MediaFileRepository } from "../../domain/ports/media-file.repository";
import { Result, Ok, Err } from "oxide.ts";
import { Injectable,Inject, Logger } from "@nestjs/common";

@QueryHandler(GetMediaFileByKeyQuery)
@Injectable()
export class GetMediaFileByKeyHandler extends BaseQueryHandler<GetMediaFileByKeyQuery, Result<MediaFile,Error>> {
  protected override logger = new Logger(GetMediaFileByKeyHandler.name);
  
  constructor(
    @Inject(MEDIA_REPOSITORY)
    private readonly repository: MediaFileRepository) {
    super();
  }

  protected override async handle(query: GetMediaFileByKeyQuery): Promise<Result<MediaFile, Error>> {

    const existingRes = await Result.safe(this.repository.findByS3Key(query.s3Key));

    if (existingRes.isErr()) {
      return Err(existingRes.unwrapErr());
    }   

    const existing = existingRes.unwrap();

    if (!existing) {
      return Err(new Error('Media file not found'));
    }
    
    return Ok(existing);
  }
    
  
}