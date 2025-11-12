// src/infra/repositories/shared-account.repository.impl.ts

import { Injectable } from "@nestjs/common";
import { PrismaService, sharedAccountUserInclude, sharedAccountInclude } from "@safliix-back/database";
import { Result, Ok, Err } from "oxide.ts";
import { ISharedAccountRepository, SharedAccountLimitDetails } from "../domain/ports/shared-account.repository";
import { SharedAccount } from "../domain/entities/shared-account.entity";
import { SharedAccountUser } from "../domain/entities/shared-account-user.entity"; // L'entité corrigée
import { SharedAccountMapper } from "../domain/mappers/shared-account.mapper";
import { SharedAccountUserMapper } from "../domain/mappers/shared-account-user.mapper";
import { Password } from "@safliix-back/common"; // 🔑 Import du VO Password

@Injectable()
export class SharedAccountRepositoryImpl implements ISharedAccountRepository {
  constructor(private readonly prisma: PrismaService) {}
  
  // --- MÉTHODES DE CRÉATION (Le Service DOIT envoyer une entité avec le PIN haché) ---

  async createSharedAccount(data: SharedAccount): Promise<Result<SharedAccount, Error>> {
    // Le Mapper doit extraire le hash (data.profiles[i].pinCode.value)
    const prismaData = SharedAccountMapper.toPrismaCreate(data); 
    try {
      const account = await this.prisma.sharedAccount.create({
        data: prismaData,
        include: sharedAccountInclude,
      });

      const a = SharedAccountMapper.toDomain(account);
      return Ok(a);
    } catch (e) {
      return Err(e as Error);
    }
  }

  async addProfile(data:SharedAccountUser): Promise<Result<SharedAccountUser, Error>> {
    // Le Mapper doit extraire le hash (data.pinCode.value)
    const prismaData = SharedAccountUserMapper.toPrismaCreate(data);
    try {
      const profile = await this.prisma.sharedAccountUser.create({
        data: prismaData,
        include: sharedAccountUserInclude
      });

      const shared = SharedAccountUserMapper.toDomain(profile);
      return Ok(shared);
    } catch (e) {
      return Err(e as Error);
    }
  }

  // --- NOUVELLE LOGIQUE : CONNEXION AU PROFIL (Utilisation du Hachage) ---

  async loginWithProfile(accountId: string, profileName: string, pinCode: number): Promise<Result<SharedAccountUser, Error>> {
    try {
        // 1. Trouver le profil
        const profileData = await this.prisma.sharedAccountUser.findUnique({
            where: {
              sharedAccountId_profileName: {
                sharedAccountId: accountId,
                profileName: profileName
              }
            },
            // Ne pas inclure sharedAccountUserInclude car nous n'avons besoin que du hash pour l'instant
        });

        if (!profileData) {
            return Err(new Error("Profile not found or associated with account."));
        }
        
        // 2. RESTAURER le Value Object Password à partir du hash stocké
        // 🚨 Assurez-vous que le champ pinCode de la DB est une STRING pour stocker le hash
        const storedPassword = Password.restore(profileData.pinCode as unknown as string); 
        
        // 3. UTILISER la méthode compare du VO pour vérifier le PIN en clair (number converti en string)
        const isPinValid = await storedPassword.compare(pinCode.toString());
        
        if (!isPinValid) {
            return Err(new Error("Invalid PIN."));
        }

        // 4. Succès : Récupérer le profil complet pour le mapping vers le domaine
        const profileWithIncludes = await this.prisma.sharedAccountUser.findUnique({
            where: { id: profileData.id },
            include: sharedAccountUserInclude
        });
        
        // Si le profil est trouvé, il est non null ici
        return Ok(SharedAccountUserMapper.toDomain(profileWithIncludes!));
    } catch (e) {
        return Err(e as Error);
    }
  }

  // --- VÉRIFICATION D'ACCÈS (devient obsolète si vous utilisez loginWithProfile) ---
  // Note: Si vous gardez cette méthode, elle doit être corrigée de la même manière que loginWithProfile.
  async verifyAccess(profileId: string, pinCode: number): Promise<Result<boolean, Error>> {
    try {
      const profile = await this.prisma.sharedAccountUser.findUnique({
        where: { id: profileId },
      });
      if (!profile) return Err(new Error("Profile not found"));

      // 🔑 UTILISATION SÉCURISÉE DU VO PASSWORD
      const storedPassword = Password.restore(profile.pinCode as unknown as string); 
      const isValid = await storedPassword.compare(pinCode.toString());

      return Ok(isValid);
    } catch (e) {
      return Err(e as Error);
    }
  }

  // --- MÉTHODES RESTANTES (Pas de changement lié au PIN) ---

  async getSharedAccountById(accountId: string): Promise<Result<SharedAccount, Error>> {
    try {
      const account = await this.prisma.sharedAccount.findUnique({
        where: { id: accountId },
        include: sharedAccountInclude,
      });

      if (!account) {
        return Err(new Error("Shared account not found"));
      }

      return Ok(SharedAccountMapper.toDomain(account));
    } catch (e) {
      return Err(e as Error);
    }
  }

  async removeProfile(profileId: string): Promise<Result<boolean, Error>> {
    try {
      await this.prisma.sharedAccountUser.delete({
        where: { id: profileId },
      });

      return Ok(true);
    } catch (e) {
      return Err(e as Error);
    }
  }

  async listProfiles(accountId: string): Promise<Result<SharedAccountUser[], Error>> {
    try {
      const profiles = await this.prisma.sharedAccountUser.findMany({
        where: { sharedAccountId: accountId },
        include: sharedAccountUserInclude,
        orderBy: { createdAt: 'asc' },
      });

      return Ok(profiles.map((profile) => SharedAccountUserMapper.toDomain(profile)));
    } catch (e) {
      return Err(e as Error);
    }
  }
  
  async deleteSharedAccount(accountId: string): Promise<Result<boolean, Error>> {
    try {
      await this.prisma.sharedAccount.delete({
        where: { id: accountId },
      });

      return Ok(true);
    } catch (e) {
      return Err(e as Error);
    }
  }

  async updateProfile(
    profileId: string,
    data: SharedAccountUser
  ): Promise<Result<SharedAccountUser, Error>> {
    // IMPORTANT: Si 'pinCode' est dans 'data', il doit déjà être un VO/Hash ici
    try {
      // Le mapper doit gérer l'extraction du hash si pinCode est passé.
      const updateData = SharedAccountUserMapper.toPrismaUpdate(profileId,data);
      
      const updated = await this.prisma.sharedAccountUser.update({...updateData, include:sharedAccountUserInclude});

      const result = SharedAccountUserMapper.toDomain(updated);
      // Le mappage vers le domaine peut nécessiter des ajustements si l'objet DB n'est pas complet
      return Ok(result);
    } catch (e) {
      return Err(e as Error);
    }
  }

  async getAccountWithDetails(accountId: string): Promise<Result<SharedAccountLimitDetails, Error>> {
    try {
      const now = new Date();
      const account = await this.prisma.sharedAccount.findUnique({
        where: { id: accountId },
        include: {
          owner: {
            select: {
              id: true,
              subscriptions: {
                where: {
                  endDate: { gt: now },
                },
                orderBy: { endDate: 'desc' },
                take: 1,
                include: {
                  plan: {
                    select: { maxSharedAccounts: true },
                  },
                },
              },
            },
          },
          profiles: {
            select: { id: true },
          },
        },
      });

      if (!account) {
        return Err(new Error("Shared account not found"));
      }

      const activeSubscription = account.owner.subscriptions[0];

      if (!activeSubscription?.plan) {
        return Err(
          new Error('Aucun abonnement actif trouvé pour ce compte partagé.'),
        );
      }

      const details: SharedAccountLimitDetails = {
        accountId: account.id,
        ownerUserId: account.ownerUserId,
        currentActiveProfiles: account.profiles.length,
        maxSharedAccountsLimit: activeSubscription.plan.maxSharedAccounts,
      };

      return Ok(details);
    } catch (e) {
      return Err(e as Error);
    }
  }

  async findProfileForOwner(
    accountId: string,
    profileId: string,
  ): Promise<Result<SharedAccountUser, Error>> {
    try {
      const profile = await this.prisma.sharedAccountUser.findFirst({
        where: {
          id: profileId,
          sharedAccount: {
            ownerUserId: accountId,
          },
        },
        include: sharedAccountUserInclude,
      });

      if (!profile) {
        return Err(new Error('Profil introuvable pour ce compte.'));
      }

      return Ok(SharedAccountUserMapper.toDomain(profile));
    } catch (e) {
      return Err(e as Error);
    }
  }
}
