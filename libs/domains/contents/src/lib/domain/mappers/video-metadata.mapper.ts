import { VideoMetadata } from "../entities/video-metadata.value-object";
import { VideoCategoryMapper } from "./video-category.mapper";
import { VideoFormatMapper } from "./video-format.mapper";
import { Result, Ok, Err } from "oxide.ts";
import {
  MetadataToPrisma,
  VideoFormatToPrisma,
  VideoCategoryToPrisma,
  VideoActorToPrisma,
  MetadataWithRelations
} from "@safliix-back/database";

export class VideoMetadataMapper {

  static toDomain(prismaMetadata: MetadataWithRelations): Result<VideoMetadata, Error> {
    
    if (!prismaMetadata) {
      return Err(new Error("Prisma metadata is required"));
    }
    if (!prismaMetadata.format || !prismaMetadata.category) {
      return Err(new Error("Prisma metadata must include format and category"));
    }
    
    const formatResult = VideoFormatMapper.toDomain(prismaMetadata.format);
    if (formatResult.isErr()) {
      return Err(new Error(`Failed to map VideoFormat: ${formatResult.unwrapErr().message}`));
    }
    const categoryResult = VideoCategoryMapper.toDomain(prismaMetadata.category);

    if (categoryResult.isErr()) {
      return Err(new Error(`Failed to map VideoCategory: ${categoryResult.unwrapErr().message}`));
    }

    /* const actors = prismaMetadata.actors.map(a => 
      new VideoActor(
        a.actor.id,
        a.actor.name,
        a.actor.bio,
        a.actor.dateOfBirth
      )
    ); */

    const metadataResult = VideoMetadata.create(
      prismaMetadata.id,
      prismaMetadata.title,
      prismaMetadata.description,
      prismaMetadata.thumbnailUrl,
      prismaMetadata.productionHouse,
      prismaMetadata.director,
      prismaMetadata.secondaryImage,
      prismaMetadata.releaseDate,
      prismaMetadata.platformDate,
      categoryResult.unwrap(),
      formatResult.unwrap(),
      prismaMetadata.actors.map(actor => ({
        name: actor.actor.name,
        role: actor.role ?? undefined,
        actorId: actor.actor.id
      }))
      
    );

    if (metadataResult.isErr()) {
      return Err(metadataResult.unwrapErr());
    }

    return Ok(metadataResult.unwrap());
     
  }

  static toPrisma(metadata: VideoMetadata): MetadataToPrisma {
    return {
      id: metadata.id ?? undefined,
      title: metadata.title,
      description: metadata.description,

      format: {
        connectOrCreate: {
          where: { id: metadata.format?.id },
          create: {
            format: metadata.format?.format,
            description: metadata.format?.description,
          } as VideoFormatToPrisma,
        },
      },

      category: {
        connectOrCreate: {
          where: { id: metadata.category?.id },
          create: {
            category: metadata.category?.category,
            description: metadata.category?.description,
          } as VideoCategoryToPrisma,
        },
      },

      actors: {
        create: metadata.actors.map(actor => ({
          actor: {
            connectOrCreate: {
              where: { id: actor.actorId as string },
              create: {
                name: actor.name,
              } as VideoActorToPrisma,
            },
          },
        })),
      },
      
      thumbnailUrl: metadata.thumbnail,
      secondaryImage: metadata.secondaryImage == null ? '': metadata.secondaryImage,
      releaseDate: metadata.releaseDate,
      platformDate: metadata.platformDate,
      ageRating: '',
      productionHouse: metadata.productionHouse,
      productionCountry:"",
      director: metadata.director,
      status: "",
      
    };
  }
}
    
     

  

