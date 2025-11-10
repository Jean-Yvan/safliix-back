
import { BaseHandler } from "@safliix-back/cqrs";
import { Result, Ok, Err } from "oxide.ts";
import { Inject, Injectable } from "@nestjs/common";
import { CommandHandler } from "@nestjs/cqrs";
import type { ISubscriptionRepository } from "../../domain/ports/subscription.repository";
import { SUBSCRIPTION_REPOSITORY } from "../../utils/types";
import { DeleteSubscriptionCommand } from "../cqrs/commands/delete-subscription.command";

@Injectable()
@CommandHandler(DeleteSubscriptionCommand)
export class DeleteSubscriptionHandler extends BaseHandler<DeleteSubscriptionCommand, Result<void, Error>> {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly repository: ISubscriptionRepository
  ) {
    super();
  }

  protected override async handle(command: DeleteSubscriptionCommand): Promise<Result<void, Error>> {
    const deleteResult = await this.repository.delete(command.id);
    return deleteResult.isErr() ? Err(deleteResult.unwrapErr()) : Ok(undefined);
  }
}
