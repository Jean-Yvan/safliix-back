// libs/shared-account/commands/handlers/add-profile-to-account.handler.ts

import { CommandHandler } from '@nestjs/cqrs';
import { Inject, Injectable, ForbiddenException, ConflictException } from '@nestjs/common';
import { Result, Err } from 'oxide.ts';

import type { ISharedAccountRepository } from '../../domain/ports/shared-account.repository';
import { SharedAccountUser } from '../../domain/entities/shared-account-user.entity';
import { AddProfileToAccountCommand } from '../cqrs/commands/profile.command';

import { BaseHandler } from '@safliix-back/cqrs';
import { SHARED_ACCOUNT_REPOSITORY } from '../../utils/types';


@CommandHandler(AddProfileToAccountCommand)
@Injectable()
export class AddProfileToAccountHandler extends BaseHandler<AddProfileToAccountCommand, Result<SharedAccountUser,Error>> {
  
  constructor(
    @Inject(SHARED_ACCOUNT_REPOSITORY)
    private readonly sharedAccountRepository: ISharedAccountRepository,
  ) {
    super();
  }

  override async handle(command: AddProfileToAccountCommand): Promise<Result<SharedAccountUser, Error>> {
    const { shareAccountId } = command.payload;
    
    // ÉTAPE 1 : VÉRIFICATION DE LA LIMITE (Critique pour la règle d'abonnement)
    const accountDetailsResult = await this.sharedAccountRepository.getAccountWithDetails(shareAccountId);

    if (accountDetailsResult.isErr()) {
        return Err(new Error("Erreur de vérification des limites de l'abonnement."));
    }

    const details = accountDetailsResult.unwrap();
    
    if (details.currentActiveProfiles >= details.maxSharedAccountsLimit) {
        // 🛑 Blocage de la création : Limite Souple
        throw new ForbiddenException(`Limite maximale de ${details.maxSharedAccountsLimit} profils atteinte.`);
    }

   
    // ÉTAPE 3 : CRÉATION DE L'ENTITÉ et PERSISTANCE
    const newProfile = await SharedAccountUser.create(command.payload);

    if(newProfile.isErr()){
      return Err(newProfile.unwrapErr());
    }

    const creationResult = await this.sharedAccountRepository.addProfile(newProfile.unwrap());
    
    if (creationResult.isErr()) {
        // Gérer l'erreur de Contrainte Unique (nom de profil déjà pris)
        if (creationResult.unwrapErr().message.includes('unique constraint')) {
            return Err(new ConflictException(`Le nom de profil '${newProfile.unwrap().profileName}' est déjà utilisé.`));
        }
        return Err(creationResult.unwrapErr());
    }

    return creationResult;
  }
}
