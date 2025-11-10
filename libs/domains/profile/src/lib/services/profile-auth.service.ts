import { Injectable,UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "@safliix-back/database";

@Injectable()
export class ProfileContextService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveProfile(userPayload: any): Promise<{ profileId: string; accountId: string }> {
    
    // CAS 1 : Jeton de Profil Interne (Utilisateur Partagé)
    // Identifié par le 'auth_type' que nous avons ajouté au payload
    if (userPayload.auth_type === 'PROFILE_PIN') {
        return { 
            profileId: userPayload.sub,        // sub est le SharedAccountUser ID
            accountId: userPayload.account_id 
        };
    } 
    
    // CAS 2 : Jeton Keycloak (Compte Principal)
    // Identifié par la présence de propriétés Keycloak standard (ex: 'aud', 'sub' qui est le keycloakId)
    else if (userPayload.sub && userPayload.azp) { // azp est souvent le client_id, présent dans les JWT KC
        const keycloakId = userPayload.sub; 

        // 1. Trouver l'ID du compte interne (User)
        const account = await this.prisma.user.findUnique({
          where: { keycloakId },
          select: { id: true }
        });

        if (!account) { throw new UnauthorizedException('Compte principal non lié en DB.'); }
        
        // 2. Trouver le profil PAR DÉFAUT de ce compte
        // Logique : On trouve le SharedAccount lié, puis le premier profil (ou celui marqué 'is_main')
        const sharedAccount = await this.prisma.sharedAccount.findFirst({
            where: { ownerUserId: account.id },
            // On peut chercher le profil avec le nom 'Principal' ou simplement prendre le premier
            include: { profiles: { take: 1, orderBy: { createdAt: 'asc' } } } 
        });

        if (!sharedAccount || sharedAccount.profiles.length === 0) {
            throw new UnauthorizedException('Veuillez d\'abord créer votre profil par défaut.');
        }
        
        return { 
            profileId: sharedAccount.profiles[0].id, 
            accountId: account.id 
        };
    }

    throw new UnauthorizedException('Contexte d\'authentification inconnu.');
  }
}