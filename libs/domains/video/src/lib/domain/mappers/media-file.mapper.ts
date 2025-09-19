import { MediaFile } from "../entities/media-file.entity";
import { CreateToPrisma, UpdateToPrisma, MediaFileWithoutRelation } from "@safliix-back/database";

export class MediaFileMapper {

  static toDomain(prismaVideoFile: MediaFileWithoutRelation): MediaFile {
    return MediaFile.restore(prismaVideoFile);
  }

  static toPrismaCreate(mediaFile: MediaFile): CreateToPrisma<"MediaFile"> {
    return {
      status: mediaFile.status,
      mediaType: mediaFile.mediaType,
      s3Key: mediaFile.s3Key,
      width: mediaFile.width,
      height: mediaFile.height,
      duration: mediaFile.duration
    };
  }

  static toPrismaUpdate(id:string,mediaFile: MediaFile): UpdateToPrisma<"MediaFile"> {
    return {
      where : {id},
      data:{
        status: mediaFile.status,
      s3Key: mediaFile.s3Key,
      width: mediaFile.width,
      height: mediaFile.height,
      duration: mediaFile.duration
      }
    }
  }
}