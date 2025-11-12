import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@safliix-back/database';

export type ProfileContext = {
  profileId: string;
  accountId: string;
};

/**
 * Résout l'identité réelle derrière un jeton (Keycloak ou profil partagé).
 */
@Injectable()
export class ProfileContextService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveProfile(userPayload: any): Promise<ProfileContext> {
    if (!userPayload) {
      throw new UnauthorizedException('Payload JWT manquant.');
    }

    if (userPayload.auth_type === 'PROFILE_PIN') {
      if (!userPayload.sub || !userPayload.account_id) {
        throw new UnauthorizedException('Jeton de profil invalide.');
      }

      return {
        profileId: userPayload.sub,
        accountId: userPayload.account_id,
      };
    }

    if (userPayload.sub && userPayload.azp) {
      const keycloakSub = String(userPayload.sub);

      const userAccount = await this.prisma.user.findUnique({
        where: { id: keycloakSub },
        select: { id: true },
      });

      if (!userAccount) {
        throw new UnauthorizedException(
          'Compte principal Keycloak non lié à un utilisateur interne.',
        );
      }

      const accountId = userAccount.id;

      const defaultProfile = await this.prisma.sharedAccountUser.findFirst({
        where: {
          sharedAccount: {
            ownerUserId: accountId,
          },
        },
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      });

      if (!defaultProfile) {
        throw new UnauthorizedException(
          "Aucun profil par défaut n'a été trouvé pour ce compte. Veuillez compléter l'enregistrement.",
        );
      }

      return {
        profileId: defaultProfile.id,
        accountId,
      };
    }

    throw new UnauthorizedException(
      "Contexte d'authentification inconnu ou non pris en charge.",
    );
  }
}
