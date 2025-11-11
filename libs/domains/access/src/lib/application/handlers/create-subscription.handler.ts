import { BaseHandler } from "@safliix-back/cqrs";
import { Result, Err } from "oxide.ts";
import { Inject, Injectable } from "@nestjs/common";
import { CommandHandler } from "@nestjs/cqrs";
import type { ISubscriptionRepository } from "../../domain/ports/subscription.repository";
import { SUBSCRIPTION_REPOSITORY } from "../../utils/types";
import { Subscription, extendSubscriptionEndDate } from "../../domain/entities/subscription.entity";
import { CreateSubscriptionCommand } from "../cqrs/commands/create-subscription.command";
import { ActiveSubscriptionNotFoundError } from "../../domain/errors/active-subscription-not-found.error";

@Injectable()
@CommandHandler(CreateSubscriptionCommand)
export class CreateSubscriptionHandler extends BaseHandler<CreateSubscriptionCommand, Result<Subscription, Error>> {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly repository: ISubscriptionRepository
  ) {
    super();
  }

  protected override async handle(command: CreateSubscriptionCommand): Promise<Result<Subscription, Error>> {
    const activeResult = await this.repository.findActiveByUser(command.payload.userId);

    if (activeResult.isOk()) {
      return this.extendExistingSubscription(activeResult.unwrap(), command);
    }

    const possibleNotFound = activeResult.unwrapErr();
    if (!(possibleNotFound instanceof ActiveSubscriptionNotFoundError)) {
      return Err(possibleNotFound);
    }

    const subResult = Subscription.create({
      userId: command.payload.userId,
      planId: command.payload.planId,
      country: command.payload.country ?? null,
    });

    if (subResult.isErr()) {
      return Err(subResult.unwrapErr());
    }

    return this.repository.create(subResult.unwrap());
  }

  private async extendExistingSubscription(
    existing: Subscription,
    command: CreateSubscriptionCommand
  ): Promise<Result<Subscription, Error>> {
    if (!existing.id) {
      return Err(new Error("L'abonnement actif ne possède pas d'identifiant"));
    }

    const updateResult = existing.updateWith({
      planId: command.payload.planId,
      country: command.payload.country ?? undefined,
      endDate: extendSubscriptionEndDate(existing.endDate),
    });

    if (updateResult.isErr()) {
      return Err(updateResult.unwrapErr());
    }

    return this.repository.update(existing.id, updateResult.unwrap());
  }
}
