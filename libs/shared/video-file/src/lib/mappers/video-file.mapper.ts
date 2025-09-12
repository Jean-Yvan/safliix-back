import { VideoFile } from "../entities/video-file.entity";
import { CreateToPrisma, UpdateToPrisma, VideoFileWithoutRelation } from "@safliix-back/database";

export class VideoFileMapper {

  static toDomain(prismaVideoFile: VideoFileWithoutRelation): VideoFile {
    return VideoFile.restore(prismaVideoFile);
  }

  static toPrismaCreate(videoFile: VideoFile): CreateToPrisma<"VideoFile"> {
    return {
      filePath: videoFile.filePath,
      trailerPath: videoFile.trailerPath,
      width: videoFile.width,
      height: videoFile.height,
      duration: videoFile.duration
    };
  }

  static toPrismaUpdate(id:string,videoFile: VideoFile): UpdateToPrisma<"VideoFile"> {
    return {
      where : {id},
      data:{
        filePath: videoFile.filePath,
        trailerPath: videoFile.trailerPath,
        width: videoFile.width,
        height: videoFile.height,
        duration: videoFile.duration
      }
    }
  }
}