import { BaseQueryHandler } from "@safliix-back/cqrs";
import { Result } from "oxide.ts";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { QueryHandler } from "@nestjs/cqrs";
import type { ISubscriptionRepository } from "../../domain/ports/subscription.repository";
import { SUBSCRIPTION_REPOSITORY } from "../../utils/types";

import { IsUserSubscribedToPlanQuery } from "../cqrs/queries/is-user-subscribed-to-plan.query";


// ---------- IsUserSubscribedToPlan ----------
@Injectable()
@QueryHandler(IsUserSubscribedToPlanQuery)
export class IsUserSubscribedToPlanHandler extends BaseQueryHandler<IsUserSubscribedToPlanQuery, Result<boolean, Error>> {
  protected override logger = new Logger(IsUserSubscribedToPlanHandler.name);
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly repository: ISubscriptionRepository
  ) {
    super();
  }

  protected override async handle(query: IsUserSubscribedToPlanQuery): Promise<Result<boolean, Error>> {
    return this.repository.isUserSubscribedToPlan(query.userId, query.planId);
  }
}
