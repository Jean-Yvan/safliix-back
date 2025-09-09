import { mapField } from "@safliix-back/common";
import { User } from "../entities/user.entity";
import { CreateToPrisma, UpdateToPrisma, UserWithoutRelation, UserWithRelation } from "@safliix-back/database";

export class UserMapper {
  static toDomain(data: UserWithRelation | UserWithoutRelation): User {
    return User.restore(data);
  }

  static toPrismaCreate(user: User): CreateToPrisma<"User"> {
    return {
      email: user.email,
      password_hash: user.passwordHash,
      name: user.name,
      avatarUrl: user.avatarUrl,
      //lastLoginAt: user.lastLoginAt ?? undefined,
      isVerified: user.isVerified,
      isMainAccount: user.isMainAccount,
    } as const ;
  }

  static toPrismaUpdate(id:string,user: User): UpdateToPrisma<"User"> {
    return {
      where:{
        id: id
      },
      data:{
        name: mapField(user.name),
        email: mapField(user.email),
        avatarUrl:mapField(user.avatarUrl),
      }
    }
  }
}
