import { ActiveStream } from "../entities/active-stream.entity";
import {
  ActiveStreamWithoutRelation,
  CreateToPrisma,
  UpdateToPrisma,
} from "@safliix-back/database";

export class ActiveStreamMapper {
  static toDomain(record: ActiveStreamWithoutRelation): ActiveStream {
    return ActiveStream.restore({
      id: record.id,
      profileId: record.profileId,
      accountId: record.accountId,
      videoId: record.videoId ?? null,
      startedAt: record.startedAt,
      expiresAt: record.expiresAt,
      updatedAt: null,
    });
  }

  static toPrismaCreate(stream: ActiveStream): CreateToPrisma<"ActiveStream"> {
    const primitives = stream.toPrimitives();

    return {
      profile: { connect: { id: primitives.profileId } },
      account: { connect: { id: primitives.accountId } },
      videoId: primitives.videoId ?? undefined,
      startedAt: primitives.startedAt,
      expiresAt: primitives.expiresAt,
    };
  }

  static toPrismaUpdate(stream: ActiveStream): UpdateToPrisma<"ActiveStream"> {
    if (!stream.id) {
      throw new Error("Cannot update an ActiveStream that has no identifier");
    }

    const primitives = stream.toPrimitives();

    return {
      where: { id: primitives.id! },
      data: {
        videoId: primitives.videoId ?? undefined,
        expiresAt: primitives.expiresAt,
      },
    };
  }
}
