import { Injectable } from "@nestjs/common";
import { PrismaService, sharedAccountUserInclude } from "@safliix-back/database";
import { Result, Ok, Err } from "oxide.ts";
import { ISharedAccountRepository } from "../domain/ports/shared-account.repository";
import { SharedAccount } from "../domain/entities/shared-account.entity";
import { SharedAccountUser } from "../domain/entities/shared-account-user.entity";
import { SharedAccountMapper } from "../domain/mappers/shared-account.mapper";
import { SharedAccountUserMapper } from "../domain/mappers/shared-account-user.mapper";

@Injectable()
export class SharedAccountRepositoryImpl implements ISharedAccountRepository {
  constructor(private readonly prisma: PrismaService) {}
  
  async loginWithProfile(accountId: string, profileName: string, pinCode: number): Promise<Result<SharedAccountUser, Error>> {
    throw new Error("Method not implemented.");
  }

  async createSharedAccount(data: SharedAccount): Promise<Result<SharedAccount, Error>> {

    const prismaData = SharedAccountMapper.toPrisma(data);
    try {
      const account = await this.prisma.sharedAccount.create({
        data: prismaData,
        include: { profiles: true },
      });

      const a = SharedAccountMapper.toDomain(account);
      return Ok(a);
    } catch (e) {
      return Err(e as Error);
    }
  }

  async getSharedAccountById(accountId: string): Promise<Result<SharedAccount, Error>> {
    try {
      const account = await this.prisma.sharedAccount.findUnique({
        where: { id: accountId },
        include: { profiles: true },
      });
      if (!account) return Err(new Error("SharedAccount not found"));
      const a = SharedAccountMapper.toDomain(account);
      return Ok(a);
    } catch (e) {
      return Err(e as Error);
    }
  }

  async addProfile(data:SharedAccountUser): Promise<Result<SharedAccountUser, Error>> {
    const a = SharedAccountUserMapper.toPrisma(data);
    try {
      const profile = await this.prisma.sharedAccountUser.create({
        data: a,
        include: sharedAccountUserInclude
      },
      
    );

      const shared = SharedAccountUserMapper.toDomain(profile);
      return Ok(shared);
    } catch (e) {
      return Err(e as Error);
    }
  }

  async removeProfile(profileId: string): Promise<Result<boolean, Error>> {
    try {
      await this.prisma.sharedAccountUser.delete({ where: { id: profileId } });
      return Ok(true);
    } catch (e) {
      return Err(e as Error);
    }
  }

  async listProfiles(accountId: string): Promise<Result<SharedAccountUser[], Error>> {
    try {
      const profiles = await this.prisma.sharedAccountUser.findMany({
        where: { sharedAccountId:accountId },
        include: sharedAccountUserInclude
      },
      
    );
    const result = profiles.map((item) => SharedAccountUserMapper.toDomain(item));
      return Ok(result);
    } catch (e) {
      return Err(e as Error);
    }
  }

  async verifyAccess(profileId: string, pinCode: number): Promise<Result<boolean, Error>> {
    try {
      const profile = await this.prisma.sharedAccountUser.findUnique({
        where: { id: profileId },
      });
      if (!profile) return Err(new Error("Profile not found"));

      const isValid = profile.pinCode === pinCode;
      return Ok(isValid);
    } catch (e) {
      return Err(e as Error);
    }
  }

  async deleteSharedAccount(accountId: string): Promise<Result<boolean, Error>> {
    try {
      await this.prisma.sharedAccount.delete({ where: { id: accountId } });
      return Ok(true);
    } catch (e) {
      return Err(e as Error);
    }
  }

  async updateProfile(
    profileId: string,
    data: Partial<Pick<SharedAccountUser, "profileName" | "avatarUrl" | "pinCode">>
  ): Promise<Result<SharedAccountUser, Error>> {
    try {
      const updated = await this.prisma.sharedAccountUser.update({
        where: { id: profileId },
        data,
      });
      return Ok(updated as unknown as SharedAccountUser);
    } catch (e) {
      return Err(e as Error);
    }
  }
}
