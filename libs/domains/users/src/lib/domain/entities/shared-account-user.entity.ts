import { Result, Ok } from "oxide.ts";
import { CreateNewProfileDto } from "../../interfaces/dto/create-new-profile.dto";
import { SharedAccountUserWithRelation } from "@safliix-back/database";
export class SharedAccountUser{
  private constructor(
    public readonly id : string | undefined,
    public readonly profileName: string,
    public readonly avatarUrl: string | null,
    public readonly pinCode: number,
    public readonly isKidProfile: boolean,
    public readonly sharedAccountId: string
  ){}


  static create(data : CreateNewProfileDto):Result<SharedAccountUser,Error>{
    return Ok(new SharedAccountUser(
      undefined,
      data.profileName,
      data.avatarUrl ?? null,
      Number(data.pinCode ?? 0),
      data.isKidProfile ?? false,
      data.shareAccountId
    ))
  }

  static restore(data: SharedAccountUserWithRelation): SharedAccountUser{
    return new SharedAccountUser(
      data.id,
      data.profileName,
      data.avatarUrl,
      Number(data.pinCode ?? 0),
      data.iskidProfile,
      data.sharedAccountId
    )
  }
}