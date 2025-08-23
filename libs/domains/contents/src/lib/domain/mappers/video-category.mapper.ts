import { VideoCategory } from "../entities/video-category.value-object";
import { Result, Ok, Err } from "oxide.ts";
import { VideoCategoryToPrisma } from "@safliix-back/database";


export class VideoCategoryMapper {

  static toDomain(prismaCategory: VideoCategoryToPrisma): Result<VideoCategory, Error> {
  
    const id = prismaCategory.id ? prismaCategory.id : undefined; 
    const category = VideoCategory.create(
      id,
      prismaCategory.category,
      prismaCategory.description
    );

    if (category.isErr()) {
      return Err(category.unwrapErr());
    }
    return Ok(category.unwrap());
      
     
  }

  static toPrisma(category: VideoCategory): VideoCategoryToPrisma {
    
    return {
      id: category.id, 
      category: category.category,
      description: category.description,
    };
  }
}