import { SharedAccountUserToPrisma, SharedAccountUserWithRelation } from "@safliix-back/database";
import { SharedAccountUser } from "../entities/shared-account-user.entity";

export class SharedAccountUserMapper{
  static toDomain(data: SharedAccountUserWithRelation):SharedAccountUser{
    return SharedAccountUser.restore(data);
  }

  static toPrisma(data:SharedAccountUser):SharedAccountUserToPrisma{
    return {
      id: data.id,
      sharedAccount:{
        connect:{
          id:data.sharedAccountId
        }
      },
      profileName: data.profileName,
      isKidProfile: data.isKidProfile,
      avatarUrl:data.avatarUrl,
      pinCode:data.pinCode,
    }
  }
}