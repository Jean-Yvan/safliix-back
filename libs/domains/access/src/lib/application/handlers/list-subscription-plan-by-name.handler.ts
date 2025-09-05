import { BaseQueryHandler } from "@safliix-back/cqrs";
import { ListSubscriptionPlanByNameQuery } from "../cqrs/queries/list-subscription-plan-by-name.query";
import { Result, Err, Ok } from "oxide.ts";
import { SubscriptionPlan } from "../../domain/entities/subscription-plan.entity";
import type { ISubscriptionPlanRepository } from "../../domain/ports/subscription-plan.repository";
import { SUBPLAN_REPOSITORY } from "../../utils/types";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { QueryHandler } from "@nestjs/cqrs";

@Injectable()
@QueryHandler(ListSubscriptionPlanByNameQuery)
export class ListSubscriptionPlanByNameHandler extends BaseQueryHandler<
  ListSubscriptionPlanByNameQuery,
  Result<SubscriptionPlan, Error>
> {
  protected override logger = new Logger(ListSubscriptionPlanByNameHandler.name);
  constructor(
    @Inject(SUBPLAN_REPOSITORY)
    private readonly repository: ISubscriptionPlanRepository
  ) {
    super();
  }

  protected override async handle(
    query: ListSubscriptionPlanByNameQuery
  ): Promise<Result<SubscriptionPlan, Error>> {
    const safeResult = await Result.safe(this.repository.getByName(query.name));

    if (safeResult.isErr()) {
      return Err(safeResult.unwrapErr());
    }

    return Ok(safeResult.unwrap());
  }
}
