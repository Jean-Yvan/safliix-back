import { CreateToPrisma, SharedAccountUserWithRelation, UpdateToPrisma } from "@safliix-back/database";
import { SharedAccountUser } from "../entities/shared-account-user.entity";
import { mapConnect, mapField } from "@safliix-back/common";

export class SharedAccountUserMapper{
  static toDomain(data: SharedAccountUserWithRelation):SharedAccountUser{
    return SharedAccountUser.restore(data);
  }

  static toPrismaCreate(data:SharedAccountUser):CreateToPrisma<"SharedAccountUser">{
    return {
      sharedAccount:mapConnect(data.sharedAccountId),
      profileName: data.profileName,
      avatarUrl:data.avatarUrl,
      pinCode:data.pinCode,
    }
  }

  static toPrismaUpdate(id:string,data:Partial<SharedAccountUser>):UpdateToPrisma<"SharedAccountUser">{
    return {
      where:{ id },
      data:{
        profileName: mapField(data.profileName),
        iskidProfile: mapField(data.isKidProfile),
        pinCode: mapField(data.pinCode),
        avatarUrl: mapField(data.avatarUrl)
      }
    }
  }
}