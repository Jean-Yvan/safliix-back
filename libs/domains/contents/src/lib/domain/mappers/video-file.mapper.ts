import { VideoFile } from "../entities/video-file.value-object";
import { VideoFileToPrisma } from "@safliix-back/database";
import { Result, Ok, Err } from "oxide.ts";

export class VideoFileMapper {

  static toDomain(prismaVideoFile: VideoFileToPrisma): Result<VideoFile, Error> {
    const videoFile = VideoFile.create(
      prismaVideoFile.id,
      prismaVideoFile.filePath,
      prismaVideoFile.duration,
      prismaVideoFile.trailerPath,
      prismaVideoFile.width,
      prismaVideoFile.height
    );

    if (videoFile.isErr()) {
      return Err(videoFile.unwrapErr());
    }else{
      return Ok(videoFile.unwrap());
    }
  }

  static toPrisma(videoFile: VideoFile): VideoFileToPrisma {
    return {
      id: videoFile.id,
      filePath: videoFile.filePath,
      trailerPath: videoFile.trailerPath,
      width: videoFile.width,
      height: videoFile.height,
      duration: videoFile.duration
    };
  }
}