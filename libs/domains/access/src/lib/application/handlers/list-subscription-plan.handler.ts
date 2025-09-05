import { BaseHandler } from "@safliix-back/cqrs";
import { ListSubscriptionPlanQuery } from "../cqrs/queries/list-subscription-plan.query";
import { Result, Err, Ok } from "oxide.ts";
import { SubscriptionPlan } from "../../domain/entities/subscription-plan.entity";
import type { ISubscriptionPlanRepository } from "../../domain/ports/subscription-plan.repository";
import { SUBPLAN_REPOSITORY } from "../../utils/types";
import { Inject, Injectable } from "@nestjs/common";
import { QueryHandler } from "@nestjs/cqrs";

@Injectable()
@QueryHandler(ListSubscriptionPlanQuery)
export class GetAllSubscriptionPlansHandler extends BaseHandler<
  ListSubscriptionPlanQuery,
  Result<SubscriptionPlan[], Error>
> {
  constructor(
    @Inject(SUBPLAN_REPOSITORY)
    private readonly repository: ISubscriptionPlanRepository
  ) {
    super();
  }

  protected override async handle(
    query: ListSubscriptionPlanQuery
  ): Promise<Result<SubscriptionPlan[], Error>> {
    const safeResult = await Result.safe(this.repository.getAll());

    if (safeResult.isErr()) {
      return Err(safeResult.unwrapErr());
    }

    return Ok(safeResult.unwrap());
  }
}
