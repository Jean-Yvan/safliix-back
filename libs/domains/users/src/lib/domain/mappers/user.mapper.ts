import { User } from "../entities/user.entity";
import { UserToPrisma, UserWithoutRelation, UserWithRelation } from "@safliix-back/database";

export class UserMapper {
  static toDomain(data: UserWithRelation | UserWithoutRelation): User {
    return User.restore(data);
  }

  static toPrisma(user: User): UserToPrisma {
    return {
      id: user.id,
      email: user.email,
      password_hash: user.passwordHash,
      name: user.name,
      avatarUrl: user.avatarUrl,
      lastLoginAt: user.lastLoginAt,
      isVerified: user.isVerified,
      isMainAccount: user.isMainAccount,
      role: '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
