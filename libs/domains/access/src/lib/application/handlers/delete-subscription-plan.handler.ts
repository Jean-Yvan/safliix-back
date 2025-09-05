import { BaseHandler } from "@safliix-back/cqrs";
import { CommandHandler } from "@nestjs/cqrs";
import { Inject, Injectable } from "@nestjs/common";
import { Result, Ok, Err } from "oxide.ts";

import { DeleteSubscriptionPlanCommand } from "../cqrs/commands/delete-subscription-plan.command";
import type { ISubscriptionPlanRepository } from "../../domain/ports/subscription-plan.repository";
import { SUBPLAN_REPOSITORY } from "../../utils/types";

@Injectable()
@CommandHandler(DeleteSubscriptionPlanCommand)
export class DeleteSubscriptionPlanHandler extends BaseHandler<
  DeleteSubscriptionPlanCommand,
  Result<void, Error>
> {
  constructor(
    @Inject(SUBPLAN_REPOSITORY)
    private readonly repository: ISubscriptionPlanRepository
  ) {
    super();
  }

  protected override async handle(
    command: DeleteSubscriptionPlanCommand
  ): Promise<Result<void, Error>> {
    
    const result = await Result.safe(this.repository.delete(command.id));
    if(result.isErr()){
      return Err(result.unwrapErr())
    }
    return Ok(undefined);
    
  }
}
