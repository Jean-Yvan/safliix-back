import { CreateToPrisma, UpdateToPrisma, VideoGenderWithoutRelation } from "@safliix-back/database";
import { VideoGender } from "../entities/video-gender.value-object";

export class VideoGenderMapper{
  static toDomain(data:VideoGenderWithoutRelation) : VideoGender{
    return VideoGender.restore(data);
  }

  static toPrismaCreate(name:string): CreateToPrisma<"VideoGenre">{
    return {
      name
    }
  }

  static toPrismaUpdate(id:string,name:string): UpdateToPrisma<"VideoGenre">{
    return {
      where : {id},
      data: {
        name
      }
    }
  }
}