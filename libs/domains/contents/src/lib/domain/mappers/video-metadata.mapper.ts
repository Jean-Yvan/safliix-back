import { VideoMetadata } from "../entities/video-metadata.value-object";

import {
  MetadataWithRelations,
  CreateToPrisma,
  UpdateToPrisma
} from "@safliix-back/database";

export class VideoMetadataMapper {

  static toDomain(prismaMetadata: MetadataWithRelations): VideoMetadata {
    return VideoMetadata.restore(prismaMetadata);
  }

  static toPrismaCreate(metadata: VideoMetadata): CreateToPrisma<"VideoMetadata"> {
    return {
      title: metadata.title,
      description: metadata.description,
      format: {
        connectOrCreate: {
          where: { format: metadata.format.format },
          create: {
            format: metadata.format.format,
            description: metadata.format.description,
          } 
        },
      },

      category: {
        connectOrCreate: {
          where: { category: metadata.category.category },
          create: {
            category: metadata.category.category,
            description: metadata.category.description,
          } 
        },
      },

      gender: {
        connectOrCreate: {
          where: { name: metadata.gender.name },
          create: {
            name: metadata.gender.name
          }
        }
      },

      actors: {
        create: metadata.actors.map(actor => {
          if (actor.actorId) {
            return {
              actor: {
                connect: { id: actor.actorId },
              },
            };
          } else {
            return {
              actor: {
                create: { name: actor.name },
              },
            };
          }
        }),
      },

      
      thumbnailUrl: metadata.thumbnailUrl,
      secondaryImage: metadata.secondaryImage == null ? '': metadata.secondaryImage,
      releaseDate: metadata.releaseDate,
      platformDate: metadata.platformDate,
      ageRating: '',
      productionHouse: metadata.productionHouse,
      productionCountry:metadata.productionCountry,
      director: metadata.director,
      status: metadata.status,
      
    };
  }

  static toPrismaUpdate(id:string,metadata:VideoMetadata): UpdateToPrisma<"VideoMetadata">{
    return {
      where: {id},
      data: {
        title: metadata.title,
        description: metadata.description,
        format: {
          connectOrCreate: {
            where: { format: metadata.format.format },
            create: {
              format: metadata.format.format,
              description: metadata.format.description,
            } 
          },
        },

        category: {
          connectOrCreate: {
            where: { category: metadata.category.category },
            create: {
              category: metadata.category.category,
              description: metadata.category.description,
            } 
          },
        },

        gender: {
          connectOrCreate: {
            where: { name: metadata.gender.name },
            create: {
              name: metadata.gender.name
            }
          }
        },

        actors: {
        create: metadata.actors.map(actor => {
          if (actor.actorId) {
            return {
              actor: {
                connect: { id: actor.actorId },
              },
            };
          } else {
            return {
              actor: {
                create: { name: actor.name },
              },
            };
          }
        }),
      },
        
        thumbnailUrl: metadata.thumbnailUrl,
        secondaryImage: metadata.secondaryImage == null ? '': metadata.secondaryImage,
        releaseDate: metadata.releaseDate,
        platformDate: metadata.platformDate,
        ageRating: '',
        productionHouse: metadata.productionHouse,
        productionCountry:metadata.productionCountry,
        director: metadata.director,
        status: metadata.status,
          
        }
    }
  }
}
    
     

  

