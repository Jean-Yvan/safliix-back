// libs/auth/src/lib/keycloak.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { KeycloakBearerStrategy } from 'nest-keycloak-connect'; // Assumant que vous utilisez nest-keycloak-connect

/**
 * Stratégie pour valider les JWT émis par Keycloak.
 * Authentifie le compte principal (payeur).
 */
@Injectable()
export class KeycloakStrategy extends PassportStrategy(KeycloakBearerStrategy, 'keycloak') {
  constructor(private readonly keycloak: KeycloakBearerStrategy) {
    // Le 'super()' n'est pas nécessaire si KeycloakBearerStrategy est bien configuré
    // au niveau du module d'import de Keycloak.
    // Cette classe sert surtout à donner un nom ('keycloak') à la stratégie
    // pour l'AuthGuard.
  }

  // nest-keycloak-connect gère la validation en interne.
  // Si vous n'utilisez pas cette lib, vous implémenteriez 'passport-jwt'
  // avec l'URL des clés publiques (JWKS) de Keycloak.
}