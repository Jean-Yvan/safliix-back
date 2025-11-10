import { BaseQueryHandler } from "@safliix-back/cqrs";
import { Result } from "oxide.ts";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { QueryHandler } from "@nestjs/cqrs";
import type { ISubscriptionRepository } from "../../domain/ports/subscription.repository";
import { SUBSCRIPTION_REPOSITORY } from "../../utils/types";
import { Subscription } from "../../domain/entities/subscription.entity";

import { ListActiveSubscriptionByUserQuery } from "../cqrs/queries/list-active-subscription-by-user.query";
// ---------- GetActiveByUser ----------
@Injectable()
@QueryHandler(ListActiveSubscriptionByUserQuery)
export class ListActiveSubscriptionByUserHandler extends BaseQueryHandler<ListActiveSubscriptionByUserQuery, Result<Subscription, Error>> {
  protected override logger = new Logger(ListActiveSubscriptionByUserHandler.name);
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly repository: ISubscriptionRepository
  ) {
    super();
  }

  protected override async handle(query: ListActiveSubscriptionByUserQuery): Promise<Result<Subscription, Error>> {
    return this.repository.findActiveByUser(query.userId);
  }
}
