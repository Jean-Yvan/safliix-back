import { User } from "../entities/user.entity";
import { UserToPrisma } from "@safliix-back/database";

export class UserMapper {
  static toDomain(prisma: UserToPrisma): User {
    return User.restore({
      id: prisma.id,
      email: prisma.email,
      passwordHash: prisma.password_hash,
      name: prisma.name,
      avatarUrl: prisma.avatarUrl,
      lastLoginAt: prisma.lastLoginAt ?? undefined,
      isVerified: prisma.isVerified,
      isMainAccount: prisma.isMainAccount,
      role: prisma.role,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    });
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
