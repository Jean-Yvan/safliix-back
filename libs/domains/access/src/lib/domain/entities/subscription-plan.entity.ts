import { SubscriptionPlanWithRelation } from "@safliix-back/database";
import { CreateSubscriptionPlanDto } from "../../interfaces/dto/create-subscription-plan.dto";
import { Result, Err, Ok } from "oxide.ts"; 

// On peut aussi prévoir un DTO spécifique pour update
export type UpdateSubscriptionPlanDto = Partial<CreateSubscriptionPlanDto>;

export class SubscriptionPlan {
  private constructor(
    public readonly id: string | undefined,
    public readonly name: string,
    public readonly price: number,
    public readonly maxSharedAccounts: number,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null
  ) {}

  static create(data: CreateSubscriptionPlanDto): Result<SubscriptionPlan, Error> {
    if (data.price <= 0) {
      return Err(new Error("Le prix doit être un entier positif"));
    }
    if (data.maxSharedAccounts < 0) {
      return Err(new Error("Le nombre d'écran doit être un entier positif"));
    }

    return Ok(
      new SubscriptionPlan(
        undefined,
        data.name,
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

  updateWith(dto: UpdateSubscriptionPlanDto): Result<SubscriptionPlan, Error> {
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
        dto.name ?? this.name,
        newPrice,
        newMaxSharedAccounts,
        this.createdAt,
        new Date() // updatedAt mis à jour automatiquement
      )
    );
  }
}
