import { Result, Err, Ok } from "oxide.ts";
import { SubscriptionWithRelation } from "@safliix-back/database";

// Valeurs possibles pour renewalStatus
const VALID_RENEWAL_STATUSES = ["ACTIVE", "CANCELLED", "EXPIRED", "PENDING"] as const;
export type RenewalStatus = typeof VALID_RENEWAL_STATUSES[number];

export interface SubscriptionCreateProps {
  userId: string;
  planId: string;
  country?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  renewalStatus?: RenewalStatus;
}

export interface SubscriptionUpdateProps {
  userId?: string;
  planId?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  renewalStatus?: RenewalStatus;
  country?: string | null;
}

export class Subscription {
  private constructor(
    public readonly id: string | undefined,
    public readonly userId: string,
    public readonly planId: string,
    public readonly startDate: Date | null,
    public readonly endDate: Date | null,
    public readonly renewalStatus: RenewalStatus,
    public readonly country: string | null,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null
  ) {}

  static create(data: SubscriptionCreateProps): Result<Subscription, Error> {
    const userId = data.userId?.trim();
    const planId = data.planId?.trim();

    if (!userId || !planId) {
      return Err(new Error("L'utilisateur et le plan doivent être renseignés"));
    }

    return Ok(
      new Subscription(
        undefined,
        userId,
        planId,
        data.startDate ?? null,
        data.endDate ?? null,
        (data.renewalStatus ?? "PENDING") as RenewalStatus,
        data.country?.trim() ?? null,
        null,
        null
      )
    );
  }

  static restore(data: SubscriptionWithRelation): Subscription {
    return new Subscription(
      data.id,
      data.userId,
      data.planId,
      data.startDate,
      data.endDate,
      data.renewalStatus,
      data.country,
      data.createdAt,
      data.updatedAt
    );
  }

  updateWith(dto: SubscriptionUpdateProps): Result<Subscription, Error> {
    const newUserId = dto.userId?.trim() ?? this.userId;
    const newPlanId = dto.planId?.trim() ?? this.planId;
    const newStartDate = dto.startDate !== undefined ? dto.startDate : this.startDate;
    const newEndDate = dto.endDate !== undefined ? dto.endDate : this.endDate;
    const newRenewalStatus = dto.renewalStatus ?? this.renewalStatus;
    const newCountry = dto.country !== undefined ? dto.country : this.country;

    // Validation userId / planId
    if (!newUserId || !newPlanId) {
      return Err(new Error("L'utilisateur et le plan doivent être renseignés"));
    }

    // Validation des dates
    if (newStartDate && newEndDate && newEndDate < newStartDate) {
      return Err(new Error("La date de fin ne peut pas être antérieure à la date de début"));
    }

    // Validation renewalStatus
    if (newRenewalStatus && !VALID_RENEWAL_STATUSES.includes(newRenewalStatus)) {
      return Err(new Error(`Statut de renouvellement invalide: ${newRenewalStatus}`));
    }

    return Ok(
      new Subscription(
        this.id,
        newUserId,
        newPlanId,
        newStartDate,
        newEndDate,
        newRenewalStatus,
        newCountry,
        this.createdAt,
        new Date() // updatedAt mis à jour
      )
    );
  }
}
