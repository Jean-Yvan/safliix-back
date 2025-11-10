import { SubscriptionPlanWithRelation } from "@safliix-back/database";
import { Result, Err, Ok } from "oxide.ts"; 

export interface SubscriptionPlanProps {
  name: string;
  price: number;
  maxSharedAccounts: number;
}

export type UpdateSubscriptionPlanProps = Partial<SubscriptionPlanProps>;

export class SubscriptionPlan {
  private constructor(
    public readonly id: string | undefined,
    public readonly name: string,
    public readonly price: number,
    public readonly maxSharedAccounts: number,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null
  ) {}

  static create(data: SubscriptionPlanProps): Result<SubscriptionPlan, Error> {
    if (!data.name?.trim()) {
      return Err(new Error("Le nom du plan est requis"));
    }
    if (data.price <= 0) {
      return Err(new Error("Le prix doit être un entier positif"));
    }
    if (data.maxSharedAccounts < 0) {
      return Err(new Error("Le nombre d'écran doit être un entier positif"));
    }

    return Ok(
      new SubscriptionPlan(
        undefined,
        data.name.trim(),
        data.price,
        data.maxSharedAccounts,
        null,
        null
      )
    );
  }

  static restore(data: SubscriptionPlanWithRelation): SubscriptionPlan {
    return new SubscriptionPlan(
      data.id,
      data.name,
      data.price,
      data.maxSharedAccounts,
      data.createdAt,
      data.updatedAt
    );
  }

  updateWith(dto: UpdateSubscriptionPlanProps): Result<SubscriptionPlan, Error> {
    const newPrice = dto.price ?? this.price;
    const newMaxSharedAccounts = dto.maxSharedAccounts ?? this.maxSharedAccounts;

    if (newPrice <= 0) {
      return Err(new Error("Le prix doit être un entier positif"));
    }
    if (newMaxSharedAccounts < 0) {
      return Err(new Error("Le nombre d'écran doit être un entier positif"));
    }

    return Ok(
      new SubscriptionPlan(
        this.id,
        dto.name?.trim() ?? this.name,
        newPrice,
        newMaxSharedAccounts,
        this.createdAt,
        new Date() // updatedAt mis à jour automatiquement
      )
    );
  }
}
