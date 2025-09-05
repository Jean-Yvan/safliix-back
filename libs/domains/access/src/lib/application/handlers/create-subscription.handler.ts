import { BaseHandler } from "@safliix-back/cqrs";
import { Result, Ok, Err } from "oxide.ts";
import { Inject, Injectable } from "@nestjs/common";
import { CommandHandler } from "@nestjs/cqrs";
import type { ISubscriptionRepository } from "../../domain/ports/subscription.repository";
import { SUBSCRIPTION_REPOSITORY } from "../../utils/types";
import { Subscription } from "../../domain/entities/subscription.entity";
import { CreateSubscriptionCommand } from "../cqrs/commands/create-subscription.command";

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
    const subResult = Subscription.create(command.payload); // en supposant que Subscription a une méthode create()
    if (subResult.isErr()) {
      return Err(subResult.unwrapErr());
    }

    const safeResult = await Result.safe(this.repository.create(subResult.unwrap()));
    return safeResult.isErr() ? Err(safeResult.unwrapErr()) : Ok(safeResult.unwrap());
  }
}
