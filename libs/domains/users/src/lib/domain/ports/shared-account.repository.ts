import { Result } from "oxide.ts";
import { SharedAccount } from "../entities/shared-account.entity";
import { SharedAccountUser } from "../entities/shared-account-user.entity";

export abstract class ISharedAccountRepository {
  // Créer un compte partagé lié à un owner
  abstract createSharedAccount(data:SharedAccount): Promise<Result<SharedAccount, Error>>;

  // Récupérer un compte partagé par son id
  abstract getSharedAccountById(accountId: string): Promise<Result<SharedAccount, Error>>;

  // Supprimer un compte partagé entier (owner only)
  abstract deleteSharedAccount(accountId: string): Promise<Result<boolean, Error>>;

  // Ajouter un profil (sous-compte)
  abstract addProfile(data:SharedAccountUser): Promise<Result<SharedAccountUser, Error>>;

  // Supprimer un profil
  abstract removeProfile(profileId: string): Promise<Result<boolean, Error>>;

  // Mettre à jour un profil (nom, avatar, pinCode)
  abstract updateProfile(
    profileId: string,
    updates: Partial<Pick<SharedAccountUser, "profileName" | "avatarUrl" | "pinCode">>
  ): Promise<Result<SharedAccountUser, Error>>;

  // Lister tous les profils d’un compte
  abstract listProfiles(accountId: string): Promise<Result<SharedAccountUser[], Error>>;

  // Vérifier qu’un userId donné est bien le owner du SharedAccount
  abstract verifyAccess(rofileId: string, pinCode: number): Promise<Result<boolean, Error>>;

  // Connexion par profil (nom + pinCode)
  abstract loginWithProfile(
    accountId: string,
    profileName: string,
    pinCode: number
  ): Promise<Result<SharedAccountUser, Error>>;
}
