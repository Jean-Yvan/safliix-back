// src/domain/entities/shared-account-user.entity.ts

import { Result, Ok, Err } from "oxide.ts";
// ⚠️ Assurez-vous d'avoir le bon chemin pour votre DTO et votre Value Object
import { CreateNewProfileDto } from "../../interfaces/dto/create-new-profile.dto"; 
import { SharedAccountUserWithRelation } from "@safliix-back/database"; 
import { Password } from "@safliix-back/common"; 

export class SharedAccountUser{
  private constructor(
    public readonly id : string | undefined,
    public readonly profileName: string,
    public readonly avatarUrl: string | null,
    // 🔑 Le PIN est désormais un Value Object de type Password
    public readonly pinCode: Password, 
    public readonly isKidProfile: boolean,
    public readonly sharedAccountId: string
  ){}

  /**
   * Crée une nouvelle entité SharedAccountUser à partir d'un DTO.
   * Cette méthode est ASYNCHRONE car elle HACHE le PIN.
   */
  static async create(data : CreateNewProfileDto): Promise<Result<SharedAccountUser,Error>>{
    // 1. Récupérer le PIN en clair et tenter de créer le Value Object Password (Hachage)
    const rawPin = data.pinCode.toString();
    const pinCodeResult = await Password.create(rawPin); 

    if(pinCodeResult.isErr()){
      // Si le hachage échoue (problème bcrypt), propager l'erreur
      return Err(pinCodeResult.unwrapErr()); 
    }
    
    // 2. Créer l'entité avec le Value Object haché
    return Ok(new SharedAccountUser(
      undefined,
      data.profileName,
      data.avatarUrl ?? null,
      pinCodeResult.unwrap(), // 🔑 Passe le Value Object Password (contient le hash)
      data.isKidProfile ?? false,
      data.shareAccountId
    ))
  }

  /**
   * Restaure l'entité depuis les données de la base de données (Prisma).
   */
  static restore(data: SharedAccountUserWithRelation): SharedAccountUser{
    // 1. Récupérer le hash stocké (String) de la DB
    const storedPinHash = data.pinCode.toString(); 

    // 2. Restaurer le Value Object Password à partir du hash existant
    const restoredPinCode = Password.restore(storedPinHash); 
    
    return new SharedAccountUser(
      data.id,
      data.profileName,
      data.avatarUrl,
      restoredPinCode, // 🔑 Passe le Value Object restauré
      data.iskidProfile,
      data.sharedAccountId
    )
  }
}