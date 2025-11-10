// apps/svod-api-client/src/auth/profile-auth.application.service.ts (VERSION CORRIGÉE)

import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ProfileLoginQuery,ProfileTokenGenerationService  } from '@safliix-back/profile'; // Import corrigé du module Profile
import { IUserRepository, USER_REPOSITORY } from '@safliix-back/users'; // Interface du User

@Injectable()
export class ProfileAuthApplicationService { 
  constructor(
    private readonly queryBus: QueryBus,
    private readonly internalTokenService: ProfileTokenGenerationService,
    @Inject(USER_REPOSITORY) 
    private readonly userRepository: IUserRepository, 
  ) {}

  /**
   * Authentifie un profil par PIN en utilisant l'email du propriétaire.
   */
  async authenticateProfile(ownerEmail: string, profileName: string, pinCode: number): Promise<string> {
    
    // 1. NOUVELLE ÉTAPE : Traduire l'email en ID interne (dépendance au module USER)
    const userResult = await this.userRepository.findByEmail(ownerEmail);
    if (userResult.isErr()) {
        throw new UnauthorizedException("Le compte principal n'existe pas ou l'email est invalide.");
    }
    const accountId = userResult.unwrap().id; // 🔑 ID interne récupéré

    // 2. Envoyer la Query avec l'ID interne résolu (dépendance au module PROFILE)
    if( accountId ) {
      const query = new ProfileLoginQuery(accountId, profileName, pinCode); 
      const result = await this.queryBus.execute(query);

      if (result.isErr()) {
        throw new UnauthorizedException(result.unwrapErr().message || 'Échec de l\'authentification du profil.');
      }

      const profile = result.unwrap();

      // 3. Émission du Jeton de Profil Interne
      const profileToken = this.internalTokenService.generateProfileToken(
        profile.id as string, 
        profile.sharedAccountId
      );

      return profileToken;
    }else{
      throw new UnauthorizedException('Échec de l\'authentification du profil.');

    }
    
  }
}