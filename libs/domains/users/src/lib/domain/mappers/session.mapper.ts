import { Session } from "../entities/session.entity";
import { SessionToPrisma, SessionWithUser } from "@safliix-back/database";

export class SessionMapper {
  static toDomain(prisma: SessionWithUser): Session {
    return Session.restore(prisma);
  }

  static toPrisma(session: Session): SessionToPrisma {
    return {
      id: session.id,
      user:{
        connect:{
          id: session.userId
        }
      },
      refreshToken: session.refreshToken,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      expiresAt: session.expiresAt!,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }
}
