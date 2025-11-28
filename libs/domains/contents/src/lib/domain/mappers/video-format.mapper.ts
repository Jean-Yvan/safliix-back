import { CreateToPrisma, UpdateToPrisma, VideoFormatWithoutRelation } from "@safliix-back/database";
import { VideoFormat } from "../entities/video-format.value-object";


export class VideoFormatMapper {

  static toDomain(prismaFormat: VideoFormatWithoutRelation): VideoFormat {
    return VideoFormat.restore(prismaFormat);
  }

  static toPrismaCreate(format: VideoFormat): CreateToPrisma<"VideoFormat"> {
    return {
      format: format.format,
      description: format.description,
    };
  }

  static toPrismaUpdate(id:string,format: VideoFormat): UpdateToPrisma<"VideoFormat">{
    return {
      where: {id},
      data: {
        format: format.format,
        description: format.description,
      }
    }
  }
}