import { BaseHandler } from "@safliix-back/cqrs"
import { CreateSubscriptionPlanCommand } from "../cqrs/commands/create-subscription-plan.command";
import { Result, Err, Ok } from "oxide.ts";
import { SubscriptionPlan } from "../../domain/entities/subscription-plan.entity";
import type { ISubscriptionPlanRepository } from "../../domain/ports/subscription-plan.repository";
import { SUBPLAN_REPOSITORY } from "../../utils/types";
import { Inject, Injectable } from "@nestjs/common";
import { CommandHandler } from "@nestjs/cqrs";


@Injectable()
@CommandHandler(CreateSubscriptionPlanCommand)
export class CreateSubscriptionPlanHandler extends BaseHandler<CreateSubscriptionPlanCommand,Result<SubscriptionPlan,Error>>{
  
  constructor(
    @Inject(SUBPLAN_REPOSITORY)
    private readonly repository: ISubscriptionPlanRepository 
  ){
    super();
  }
  
  protected override async handle(command: CreateSubscriptionPlanCommand): Promise<Result<SubscriptionPlan, Error>> {
    const subPlanResult = SubscriptionPlan.create(command.payload);
    if(subPlanResult.isErr()){
      return Err(subPlanResult.unwrapErr());
    }

    const subPlanSafe = await Result.safe(this.repository.create(subPlanResult.unwrap()));

    if(subPlanSafe.isErr()){
      return Err(subPlanSafe.unwrapErr());
    }

    return Ok(subPlanSafe.unwrap());
  }

}