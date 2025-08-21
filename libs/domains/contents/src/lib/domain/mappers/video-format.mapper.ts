import { VideoFormatToPrisma } from "@safliix-back/database";
import { VideoFormat } from "../entities/video-format.value-object";
import { Result, Ok, Err } from "oxide.ts";

export class VideoFormatMapper {

  static toDomain(prismaFormat: VideoFormatToPrisma): Result<VideoFormat, Error> {
    const result = VideoFormat.create(
      prismaFormat.id ?? undefined,
      prismaFormat.format,
      prismaFormat.description,
    );
    if (result.isOk()) {
      return Ok(result.unwrap());
    } else {
      const err = result.unwrapErr();
      return Err(err instanceof Error ? err : new Error(String(err)));
    }
  }

  static toPrisma(format: VideoFormat): VideoFormatToPrisma {
    return {
      id: format.id,
      format: format.format,
      description: format.description,
    };
  }
}