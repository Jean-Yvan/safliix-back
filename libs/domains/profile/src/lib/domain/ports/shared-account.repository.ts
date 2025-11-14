import { Result } from "oxide.ts";
import { SharedAccount } from "../entities/shared-account.entity";
import { SharedAccountUser } from "../entities/shared-account-user.entity";

export type SharedAccountLimitDetails = {
  accountId: string;
  ownerUserId: string;
  currentActiveProfiles: number;
  maxSharedAccountsLimit: number;
};

export interface ISharedAccountRepository {
  // Créer un compte partagé lié à un owner
  createSharedAccount(data:SharedAccount): Promise<Result<SharedAccount, Error>>;

  // Récupérer un compte partagé par son id
   getSharedAccountById(accountId: string): Promise<Result<SharedAccount, Error>>;

  // Supprimer un compte partagé entier (owner only)
   deleteSharedAccount(accountId: string): Promise<Result<boolean, Error>>;

  // Ajouter un profil (sous-compte)
   addProfile(data:SharedAccountUser): Promise<Result<SharedAccountUser, Error>>;

  // Supprimer un profil
   removeProfile(profileId: string): Promise<Result<boolean, Error>>;

  // Mettre à jour un profil (nom, avatar, pinCode)
   updateProfile(
    profileId: string,
    updates: Partial<Pick<SharedAccountUser, "profileName" | "avatarUrl" | "pinCode">>
  ): Promise<Result<SharedAccountUser, Error>>;

  // Lister tous les profils d’un compte
   listProfiles(accountId: string): Promise<Result<SharedAccountUser[], Error>>;

  // Obtenir les informations utiles pour contrôler la limite d'un compte partagé
   getAccountWithDetails(accountId: string): Promise<Result<SharedAccountLimitDetails, Error>>;
  
  // Connexion par profil (nom + pinCode)
   loginWithProfile(
    accountId: string,
    profileName: string,
    pinCode: number
  ): Promise<Result<SharedAccountUser, Error>>;

  // Récupère un profil appartenant à un compte propriétaire
   findProfileForOwner(
   	accountId: string,
   	profileId: string
 	): Promise<Result<SharedAccountUser, Error>>;

  verifyAccess(profileId: string, pinCode: number): Promise<Result<boolean, Error>>;
}
