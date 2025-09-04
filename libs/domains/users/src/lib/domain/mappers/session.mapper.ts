import { mapConnect } from "@safliix-back/common";
import { Session } from "../entities/session.entity";
import { CreateToPrisma, SessionWithUser, UpdateToPrisma } from "@safliix-back/database";

export class SessionMapper {
  static toDomain(prisma: SessionWithUser): Session {
    return Session.restore(prisma);
  }

  static toPrismaCreate(session: Session): CreateToPrisma<"Session"> {
    return {
      user:mapConnect(session.userId),
      refreshToken: session.refreshToken,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      expiresAt: session.expiresAt,
      
    };
  }

  static toPrismaUpdate(id:string, data:Partial<Session>) : UpdateToPrisma<"Session">{
    return {
      where : {id},
      data: {

      }
    }
  }
}
