import { Result, Err, Ok } from "oxide.ts";
import { PurchaseWithRelation } from "@safliix-back/database";
import { CreatePurchaseDto } from "../../interfaces/dto/create-purchase.dto";
import { UpdatePurchaseDto } from "../../interfaces/dto/update-purchase.dto";

export class Purchase {
  private constructor(
    public readonly id: string | undefined,
    public readonly userId: string,
    public readonly videoId: string,
    public readonly purchaseDate: Date,
    public readonly expirationDate: Date | null,
    public readonly country: string | null
  ) {}

  // Création
  static create(dto: CreatePurchaseDto): Result<Purchase, Error> {
    if (!dto.userId) {
      return Err(new Error("L'utilisateur est obligatoire"));
    }
    if (!dto.videoId) {
      return Err(new Error("La vidéo est obligatoire"));
    }
    

    return Ok(
      new Purchase(
        undefined,
        dto.userId,
        dto.videoId,
        new Date(), // purchaseDate = maintenant
        null,
        dto.country ?? null
      )
    );
  }

  // Restauration depuis Prisma
  static restore(data: PurchaseWithRelation): Purchase {
    return new Purchase(
      data.id,
      data.userId,
      data.videoId,
      data.purchaseDate,
      data.expirationDate,
      data.country
    );
  }

  // Mise à jour
  updateWith(dto: UpdatePurchaseDto): Result<Purchase, Error> {
    const newUserId = dto.userId ?? this.userId;
    const newVideoId = dto.videoId ?? this.videoId;
    //const newPurchaseDate = dto.purchaseDate ?? this.purchaseDate;
    const newExpirationDate =
      dto.expirationDate !== undefined ? dto.expirationDate : this.expirationDate;
    const newCountry = dto.country ?? this.country;

    if (!newUserId) {
      return Err(new Error("L'utilisateur est obligatoire"));
    }
    if (!newVideoId) {
      return Err(new Error("La vidéo est obligatoire"));
    }
    if (!newCountry) {
      return Err(new Error("Le pays est obligatoire"));
    }
    if (newExpirationDate && newExpirationDate < newPurchaseDate) {
      return Err(new Error("La date d'expiration ne peut pas être avant la date d'achat"));
    }

    return Ok(
      new Purchase(
        this.id,
        newUserId,
        newVideoId,
        newPurchaseDate,
        newExpirationDate,
        newCountry
      )
    );
  }
}
