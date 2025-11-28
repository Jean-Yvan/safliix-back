import { Result, Err, Ok } from "oxide.ts";
import { PurchaseWithRelation } from "@safliix-back/database";

export interface PurchaseCreateProps {
  userId: string;
  movieId: string;
  country?: string | null;
  expirationDate?: Date | null;
  purchaseDate?: Date;
}

export interface PurchaseUpdateProps {
  userId?: string;
  movieId?: string;
  expirationDate?: Date | null;
  country?: string | null;
}

export class Purchase {
  private constructor(
    public readonly id: string | undefined,
    public readonly userId: string,
    public readonly movieId: string,
    public readonly purchaseDate: Date,
    public readonly expirationDate: Date | null,
    public readonly country: string | null
  ) {}

  // Création
  static create(dto: PurchaseCreateProps): Result<Purchase, Error> {
    if (!dto.userId?.trim()) {
      return Err(new Error("L'utilisateur est obligatoire"));
    }
    if (!dto.movieId?.trim()) {
      return Err(new Error("La vidéo est obligatoire"));
    }
    

    return Ok(
      new Purchase(
        undefined,
        dto.userId.trim(),
        dto.movieId.trim(),
        dto.purchaseDate ?? new Date(), // purchaseDate = maintenant
        dto.expirationDate ?? null,
        dto.country?.trim() ?? null
      )
    );
  }

  // Restauration depuis Prisma
  static restore(data: PurchaseWithRelation): Purchase {
    return new Purchase(
      data.id,
      data.userId,
      data.movieId,
      data.purchaseDate,
      data.expirationDate,
      data.country
    );
  }

  // Mise à jour
  updateWith(dto: PurchaseUpdateProps): Result<Purchase, Error> {
    const newUserId = dto.userId?.trim() ?? this.userId;
    const newVideoId = dto.movieId?.trim() ?? this.movieId;
    const newExpirationDate =
      dto.expirationDate !== undefined ? dto.expirationDate : this.expirationDate;
    const newCountry = dto.country !== undefined ? dto.country?.trim() ?? null : this.country;

    if (!newUserId) {
      return Err(new Error("L'utilisateur est obligatoire"));
    }
    if (!newVideoId) {
      return Err(new Error("La vidéo est obligatoire"));
    }
    if (newExpirationDate && newExpirationDate < this.purchaseDate) {
      return Err(new Error("La date d'expiration ne peut pas être avant la date d'achat"));
    }

    return Ok(
      new Purchase(
        this.id,
        newUserId,
        newVideoId,
        this.purchaseDate,
        newExpirationDate,
        newCountry
      )
    );
  }
}
