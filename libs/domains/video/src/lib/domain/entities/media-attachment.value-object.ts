import { MediaAttachmentWithRelation, MediaAttachmentType } from '@safliix-back/database';
import { Result, Ok, Err } from "oxide.ts";
import { AttachMediaToElementDto } from "../../interfaces";
import { UpdateMediaAttachDto } from '../../interfaces';

export class MediaAttachment {
  
  private constructor(
    public readonly id: string | undefined,
    public videoFileId: string,
    public movieId: string | null,
    //serieId: string | null,
    public episodeId: string | null,
    public adId: string | null,
    public type: MediaAttachmentType,
    public createdAt: Date | null,
    public updatedAt: Date | null
  ) {}

  static create(dto:AttachMediaToElementDto): Result<MediaAttachment, Error> {
    if (!dto.videoFileId) {
      return Err(new Error("Media file ID is required"));
    }
    if (!dto.elementId) {
      return Err(new Error("Element ID is required"));
    }
    
   

    let movieId: string | null = null;
    let episodeId: string | null = null;
    let adId: string | null = null;

    switch (dto.elementType) {
      case "MOVIE":
        movieId = dto.elementId ?? null;
        break;
      case "EPISODE":
        episodeId = dto.elementId ?? null;
        break;
      case "AD":
        adId = dto.elementId ?? null;
        break;
      default:
        return Err(new Error("Invalid element type"));
    }

    return Ok(
      new MediaAttachment(
        undefined,
        dto.videoFileId,
        movieId,
      //  null,
        episodeId,
        adId,
        MediaAttachmentType[dto.type],
        null,
        null
      )
    );
  }

  static restore(data:MediaAttachmentWithRelation) : MediaAttachment {
    return new MediaAttachment(
      data.id,
      data.mediaFileId,
      data.movieId,
 //     data.serieId,
      data.episodeId,
      data.adId,
      MediaAttachmentType[data.type as keyof typeof MediaAttachmentType],
      null,null
    );
  }

  updateWith(dto: UpdateMediaAttachDto): Result<MediaAttachment, Error> {
    if (dto.videoFileId !== undefined) {
      this.videoFileId = dto.videoFileId;
    }
    
    if( dto.elementId != undefined){
      switch (dto.elementType) {
        case "MOVIE":
          this.movieId = dto.elementId;
          break;
        case "EPISODE":
          this.episodeId = dto.elementId;
          break;
        case "AD":
          this.adId = dto.elementId;
          break;
        default:
        return Err(new Error("Invalid element type"));
      }

      return Ok(this);
    }else{
      return Err(new Error("Element ID is required when updating element type"));
    }
    
    
  }
    
}