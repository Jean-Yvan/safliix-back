import { Result, Err, Ok } from "oxide.ts";
import { SubscriptionWithRelation } from "@safliix-back/database";

// Valeurs possibles pour renewalStatus — alignées sur Prisma
const VALID_RENEWAL_STATUSES = ["AUTO_RENEW", "MANUAL", "CANCELLED"] as const;
export type RenewalStatus = (typeof VALID_RENEWAL_STATUSES)[number];
export const DEFAULT_SUBSCRIPTION_DURATION_DAYS = 30;

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const extendSubscriptionEndDate = (
  currentEndDate?: Date | null,
  durationInDays = DEFAULT_SUBSCRIPTION_DURATION_DAYS
): Date => {
  const now = new Date();
  const base = currentEndDate && currentEndDate.getTime() > now.getTime() ? currentEndDate : now;
  return addDays(base, durationInDays);
};

const computeInitialEndDate = (
  startDate: Date,
  providedEndDate?: Date | null,
  durationInDays = DEFAULT_SUBSCRIPTION_DURATION_DAYS
): Date => {
  if (providedEndDate) {
    return providedEndDate;
  }
  return addDays(startDate, durationInDays);
};

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

    const startDate = data.startDate ?? new Date();
    const endDate = computeInitialEndDate(startDate, data.endDate);
    const renewalStatus = (data.renewalStatus ?? "AUTO_RENEW") as RenewalStatus;

    return Ok(
      new Subscription(
        undefined,
        userId,
        planId,
        startDate,
        endDate,
        renewalStatus,
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
