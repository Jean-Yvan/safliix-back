import { BaseQueryHandler } from "@safliix-back/cqrs";
import { ListSubscriptionPlanByIdQuery } from "../cqrs/queries/list-subscription-plan-by-id.query";
import { Result, Err, Ok } from "oxide.ts";
import { SubscriptionPlan } from "../../domain/entities/subscription-plan.entity";
import type { ISubscriptionPlanRepository } from "../../domain/ports/subscription-plan.repository";
import { SUBPLAN_REPOSITORY } from "../../utils/types";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { QueryHandler } from "@nestjs/cqrs";

@Injectable()
@QueryHandler(ListSubscriptionPlanByIdQuery)
export class ListSubscriptionPlanByIdHandler extends BaseQueryHandler<
  ListSubscriptionPlanByIdQuery,
  Result<SubscriptionPlan, Error>
> {
  protected override logger = new Logger(ListSubscriptionPlanByIdHandler.name);
  constructor(
    @Inject(SUBPLAN_REPOSITORY)
    private readonly repository: ISubscriptionPlanRepository
  ) {
    super();
  }

  protected override async handle(
    query: ListSubscriptionPlanByIdQuery
  ): Promise<Result<SubscriptionPlan, Error>> {
    const safeResult = await Result.safe(this.repository.getById(query.id));

    if (safeResult.isErr()) {
      return Err(safeResult.unwrapErr());
    }

    return Ok(safeResult.unwrap());
  }
}
