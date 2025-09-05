import { CreateSubscriptionDto } from "src/lib/interfaces/dto/create-subscription.dto";
import { Result, Err, Ok } from "oxide.ts";
import { SubscriptionWithRelation } from "@safliix-back/database";
import { UpdateSubscriptionDto } from "../../interfaces/dto/update-subscription.dto";

// Valeurs possibles pour renewalStatus
const VALID_RENEWAL_STATUSES = ["ACTIVE", "CANCELLED", "EXPIRED", "PENDING"] as const;
type RenewalStatus = typeof VALID_RENEWAL_STATUSES[number];


export class Subscription {
  private constructor(
    public readonly id: string | undefined,
    public readonly userId: string,
    public readonly planId: string,
    public readonly startDate: Date | null,
    public readonly endDate: Date | null,
    public readonly renewalStatus: string,
    public readonly country: string,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null
  ) {}

  static create(data: CreateSubscriptionDto): Result<Subscription, Error> {
    if (!data.userId || !data.planId) {
      return Err(new Error("L'utilisateur et le plan doivent être renseignés"));
    }

    return Ok(
      new Subscription(
        undefined,
        data.userId,
        data.planId,
        null,
        null,
        "PENDING", // par défaut
        data.country ?? "",
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

  updateWith(dto: UpdateSubscriptionDto): Result<Subscription, Error> {
    const newUserId = dto.userId ?? this.userId;
    const newPlanId = dto.planId ?? this.planId;
    const newStartDate =
  dto.startDate !== undefined
    ? dto.startDate
      ? new Date(dto.startDate) // conversion string -> Date
      : null
    : this.startDate;

const newEndDate =
  dto.endDate !== undefined
    ? dto.endDate
      ? new Date(dto.endDate)
      : null
    : this.endDate;
    const newRenewalStatus = dto.renewalStatus ?? this.renewalStatus;
    const newCountry = dto.country ?? this.country;

    // Validation userId / planId
    if (!newUserId || !newPlanId) {
      return Err(new Error("L'utilisateur et le plan doivent être renseignés"));
    }

    // Validation des dates
    if (newStartDate && newEndDate && newEndDate < newStartDate) {
      return Err(new Error("La date de fin ne peut pas être antérieure à la date de début"));
    }

    // Validation renewalStatus
    if (newRenewalStatus && !VALID_RENEWAL_STATUSES.includes(newRenewalStatus as RenewalStatus)) {
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
