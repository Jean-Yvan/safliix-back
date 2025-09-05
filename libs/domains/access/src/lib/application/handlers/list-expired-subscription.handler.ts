import { BaseQueryHandler } from "@safliix-back/cqrs";
import { Result, Ok, Err } from "oxide.ts";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { QueryHandler } from "@nestjs/cqrs";
import type { ISubscriptionRepository } from "../../domain/ports/subscription.repository";
import { SUBSCRIPTION_REPOSITORY } from "../../utils/types";
import { Subscription } from "../../domain/entities/subscription.entity";

import { ListExpiredSubscriptionsQuery } from "../cqrs/queries/list-expired-subscriptions.query";


// ---------- GetExpired ----------
@Injectable()
@QueryHandler(ListExpiredSubscriptionsQuery)
export class ListExpiredSubscriptionsHandler extends BaseQueryHandler<ListExpiredSubscriptionsQuery, Result<Subscription[], Error>> {
  protected override logger = new Logger(ListExpiredSubscriptionsHandler.name);
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly repository: ISubscriptionRepository
  ) {
    super();
  }

  protected override async handle(_: ListExpiredSubscriptionsQuery): Promise<Result<Subscription[], Error>> {
    const safeResult = await Result.safe(this.repository.findExpired());
    return safeResult.isErr() ? Err(safeResult.unwrapErr()) : Ok(safeResult.unwrap());
  }
}

