// libs/shared/keycloak-security/src/lib/shared-auth.guard.ts

import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// Tente 'keycloak' (pour l'utilisateur principal) ou 'profile-token' (pour l'utilisateur partagé)
export class SharedAuthGuard extends AuthGuard(['keycloak', 'profile-token']) { 
  
  // Surcharge la méthode pour gérer le résultat
  override handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // Si une erreur Passport survient (jeton invalide/expiré) ou si 'user' est vide
    if (err || !user) {
      throw err || new UnauthorizedException('Authentification requise (Compte principal ou Profil).');
    }
    
    // Si une stratégie a réussi, 'user' contient le payload validé
    return user; 
  }
}