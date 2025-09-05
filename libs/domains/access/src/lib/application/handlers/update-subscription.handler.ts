import { BaseHandler } from "@safliix-back/cqrs";
import { Result, Ok, Err } from "oxide.ts";
import { Inject, Injectable } from "@nestjs/common";
import { CommandHandler } from "@nestjs/cqrs";
import type { ISubscriptionRepository } from "../../domain/ports/subscription.repository";
import { SUBSCRIPTION_REPOSITORY } from "../../utils/types";
import { Subscription } from "../../domain/entities/subscription.entity";
import { UpdateSubscriptionCommand } from "../cqrs/commands/update-subscription.command";

@Injectable()
@CommandHandler(UpdateSubscriptionCommand)
export class UpdateSubscriptionHandler extends BaseHandler<UpdateSubscriptionCommand, Result<Subscription, Error>> {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly repository: ISubscriptionRepository
  ) {
    super();
  }

  protected override async handle(command: UpdateSubscriptionCommand): Promise<Result<Subscription, Error>> {
    const existed = await this.repository.findById(command.payload.id);
    const updated = existed.updateWith(command.payload);

    if(updated.isErr()){
      return Err(updated.unwrapErr());
    }
    const safeResult = await Result.safe(
      this.repository.update(command.payload.id, updated.unwrap())
    );

    return safeResult.isErr() ? Err(safeResult.unwrapErr()) : Ok(safeResult.unwrap());
  }
}
