import { VideoCategory } from "../entities/video-category.value-object";
import { CreateToPrisma, UpdateToPrisma, VideoCategoryWithoutRelation } from "@safliix-back/database";


export class VideoCategoryMapper {

  static toDomain(prismaCategory: VideoCategoryWithoutRelation): VideoCategory {
    return VideoCategory.restore(prismaCategory);
  }

  static toPrismaCreate(category: VideoCategory): CreateToPrisma<"VideoCategory">{
    
    return { 
      category: category.category,
      description: category.description,
    };
  }

  static toPrismaUpdate(id:string,category: VideoCategory): UpdateToPrisma<"VideoCategory">{
    return {
      where : {id},
      data:{
        category: category.category,
        description: category.description,
      }
    }
  }
}