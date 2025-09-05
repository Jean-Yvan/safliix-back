import { BaseHandler } from "@safliix-back/cqrs";
import { CommandHandler } from "@nestjs/cqrs";
import { Inject, Injectable } from "@nestjs/common";
import { Result, Ok, Err } from "oxide.ts";

import { UpdateSubscriptionPlanCommand } from "../cqrs/commands/update-subscription-plan.command";
import { SubscriptionPlan } from "../../domain/entities/subscription-plan.entity";
import type { ISubscriptionPlanRepository } from "../../domain/ports/subscription-plan.repository";
import { SUBPLAN_REPOSITORY } from "../../utils/types";

@Injectable()
@CommandHandler(UpdateSubscriptionPlanCommand)
export class UpdateSubscriptionPlanHandler extends BaseHandler<
  UpdateSubscriptionPlanCommand,
  Result<SubscriptionPlan, Error>
> {
  constructor(
    @Inject(SUBPLAN_REPOSITORY)
    private readonly repository: ISubscriptionPlanRepository
  ) {
    super();
  }

  protected override async handle(
    command: UpdateSubscriptionPlanCommand
  ): Promise<Result<SubscriptionPlan, Error>> {
    
      const existing = await this.repository.getById(command.payload.id);

      if (!existing) {
        return Err(new Error("Subscription plan not found"));
      }

      // On fusionne l'existant avec les updates
      const updated = existing.updateWith(command.payload);

      if(updated.isErr()){
        return Err(updated.unwrapErr());
      }

      const result = await Result.safe(this.repository.update(command.payload.id, updated.unwrap()));
      if(result.isErr()){
        return Err(result.unwrapErr());
      }
      return Ok(result.unwrap());
    
  }
}
