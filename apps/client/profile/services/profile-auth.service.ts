// apps/svod-api-client/src/auth/profile-auth.service.ts

import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ProfileLoginQuery,ProfileTokenGenerationService as InternalTokenService } from '@safliix-back/profile';

import { IUserRepository } from "@safliix-back/users";

@Injectable()
export class ProfileAuthApplicationService { // Service de "Facade" ou "Application"
  constructor(
    private readonly queryBus: QueryBus,
    private readonly internalTokenService: InternalTokenService,

    @Inject(USER_REPOSITORY)
    private readonly iUserRepository : IUserRepository
  ) {}

  /**
   * Orchestre la vérification du PIN et l'émission du jeton de profil interne.
   * @param accountId L'ID du SharedAccount (compte parent).
   * @param profileName Le nom du profil à connecter.
   * @param pinCode Le code PIN en clair.
   * @returns Un JWT de profil interne.
   */
  async authenticateProfile(email: string, profileName: string, pinCode: number): Promise<string> {
    const query = new ProfileLoginQuery(email, profileName, pinCode);

    // 1. Envoyer la Query pour la vérification du PIN (le Handler gère le repository)
    // Le QueryBus nous retourne le Result<SharedAccountUser, Error>
    const result = await this.queryBus.execute(query);

    if (result.isErr()) {
      // Le handler a retourné une erreur (PIN invalide, profil non trouvé, etc.)
      // Nous la mappons à une erreur HTTP appropriée
      throw new UnauthorizedException(result.unwrapErr().message || 'Échec de l\'authentification du profil.');
    }

    const profile = result.unwrap();

    // 2. Émission du Jeton de Profil Interne
    // Nous avons besoin de l'ID du User (l'abonné principal) à partir du SharedAccount
    const accountIdFromProfile = profile.sharedAccountId; // L'ID du SharedAccount est l'ID du parent

    const profileToken = this.internalTokenService.generateProfileToken(
      profile.id as string, 
      accountIdFromProfile
    );

    return profileToken;
  }
}