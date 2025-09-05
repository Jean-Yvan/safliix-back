import { BaseQueryHandler } from "@safliix-back/cqrs";
import { Result, Ok, Err } from "oxide.ts";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { QueryHandler } from "@nestjs/cqrs";
import type { ISubscriptionRepository } from "../../domain/ports/subscription.repository";
import { SUBSCRIPTION_REPOSITORY } from "../../utils/types";
import { Subscription } from "../../domain/entities/subscription.entity";

import { ListSubscriptionByIdQuery } from "../cqrs/queries/list-subscription-by-id.query";



// ---------- GetById ----------
@Injectable()
@QueryHandler(ListSubscriptionByIdQuery)
export class ListSubscriptionByIdHandler extends BaseQueryHandler<ListSubscriptionByIdQuery, Result<Subscription, Error>> {
  protected override logger =  new Logger(ListSubscriptionByIdHandler.name);
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly repository: ISubscriptionRepository
  ) {
    super();
  }

  protected override async handle(query: ListSubscriptionByIdQuery): Promise<Result<Subscription, Error>> {
    const safeResult = await Result.safe(this.repository.findById(query.id));
    return safeResult.isErr() ? Err(safeResult.unwrapErr()) : Ok(safeResult.unwrap());
  }
}