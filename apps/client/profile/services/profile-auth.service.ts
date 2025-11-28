// apps/svod-api-client/src/auth/profile-auth.application.service.ts (VERSION CORRIGÉE)

import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ProfileLoginQuery,
  ProfileSessionMetadata,
  ProfileSessionService,
  ProfileTokenService,
  SelectProfileQuery,
} from '@safliix-back/profile';
import type { IUserRepository } from '@safliix-back/users';
import { USER_REPOSITORY } from '@safliix-back/users';

@Injectable()
export class ProfileAuthApplicationService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly profileTokenService: ProfileTokenService,
    private readonly profileSessionService: ProfileSessionService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Authentifie un profil par PIN en utilisant l'email du propriétaire.
   */
  async authenticateProfile(
    ownerEmail: string,
    profileName: string,
    pinCode: number,
    metadata?: ProfileSessionMetadata,
  ): Promise<string> {
    
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
      const sessionId = await this.profileSessionService.startProfileSession(
        profile.id as string,
        profile.sharedAccountId,
        metadata,
      );

      const profileToken = this.profileTokenService.signProfileToken(
        profile.id as string,
        profile.sharedAccountId,
        sessionId,
        { expiresIn: '7d' },
      );

      return profileToken;
    }else{
      throw new UnauthorizedException('Échec de l\'authentification du profil.');

    }
    
  }

  /**
   * Génère un token de profil pour un compte principal authentifié.
   */
  async issueProfileTokenForOwner(
    accountId: string,
    profileId: string,
    metadata?: ProfileSessionMetadata,
  ): Promise<string> {
    const result = await this.queryBus.execute(
      new SelectProfileQuery(accountId, profileId),
    );

    if (result.isErr()) {
      throw new UnauthorizedException(
        result.unwrapErr().message || 'Profil introuvable pour ce compte.',
      );
    }

    const profile = result.unwrap();
    const sessionId = await this.profileSessionService.startProfileSession(
      profile.id as string,
      profile.sharedAccountId,
      metadata,
    );

    return this.profileTokenService.signProfileToken(
      profile.id as string,
      profile.sharedAccountId,
      sessionId,
    );
  }
}
