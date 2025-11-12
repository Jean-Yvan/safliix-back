import { Injectable } from "@nestjs/common";
import { PrismaService } from "@safliix-back/database";

import { ActiveStream } from "../domain/entities/active-stream.entity";
import { ActiveStreamRepository } from "../domain/ports/active-stream.repository";
import { ActiveStreamMapper } from "../domain/mappers/active-stream.mapper";

@Injectable()
export class PrismaActiveStreamRepository implements ActiveStreamRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProfileId(profileId: string): Promise<ActiveStream | null> {
    const record = await this.prisma.activeStream.findUnique({
      where: { profileId },
    });

    return record ? ActiveStreamMapper.toDomain(record) : null;
  }

  async findActiveByProfileId(
    profileId: string,
    referenceDate: Date = new Date()
  ): Promise<ActiveStream | null> {
    const record = await this.prisma.activeStream.findFirst({
      where: {
        profileId,
        expiresAt: { gt: referenceDate },
      },
    });

    return record ? ActiveStreamMapper.toDomain(record) : null;
  }

  async countActiveByAccount(
    accountId: string,
    referenceDate: Date = new Date()
  ): Promise<number> {
    return this.prisma.activeStream.count({
      where: {
        accountId,
        expiresAt: { gt: referenceDate },
      },
    });
  }

  async save(stream: ActiveStream): Promise<ActiveStream> {
    const primitives = stream.toPrimitives();

    if (!stream.id) {
      const upserted = await this.prisma.activeStream.upsert({
        where: { profileId: primitives.profileId },
        create: ActiveStreamMapper.toPrismaCreate(stream),
        update: {
          profile: { connect: { id: primitives.profileId } },
          account: { connect: { id: primitives.accountId } },
          videoId: primitives.videoId ?? undefined,
          startedAt: primitives.startedAt,
          expiresAt: primitives.expiresAt,
        },
      });

      return ActiveStreamMapper.toDomain(upserted);
    }

    const updateArgs = ActiveStreamMapper.toPrismaUpdate(stream);
    const updated = await this.prisma.activeStream.update(updateArgs);
    return ActiveStreamMapper.toDomain(updated);
  }

  async deleteByProfileId(profileId: string): Promise<void> {
    await this.prisma.activeStream.deleteMany({
      where: { profileId },
    });
  }

  async deleteExpired(referenceDate: Date = new Date()): Promise<number> {
    const result = await this.prisma.activeStream.deleteMany({
      where: {
        expiresAt: { lte: referenceDate },
      },
    });

    return result.count;
  }
}
