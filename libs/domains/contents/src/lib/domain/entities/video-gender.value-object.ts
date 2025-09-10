import { Result, Ok, Err } from "oxide.ts";
import { VideoGenderWithoutRelation } from "@safliix-back/database";
export class VideoGender{
  private constructor(
    public id: string | undefined,
    public name: string,
    public createdAt: Date | null,
    public updatedAt: Date | null
  ){}

  static create(data:{name:string}) : Result<VideoGender,Error>{
    if(data.name.trim().length == 0){
      return Err(new Error("Le nom du genre ne peut être vide"));
    }

    return Ok(new VideoGender(
      undefined,
      data.name,
      null,
      null
    ));
  }

  static restore(data: VideoGenderWithoutRelation) : VideoGender{
    return new VideoGender(
      data.id,
      data.name,
      data.createdAt,
      data.updatedAt
    );
  }

  updateWith(name:string) : VideoGender{
    return new VideoGender(
      this.id,
      name,
      this.createdAt,
      null
    )
  }
}