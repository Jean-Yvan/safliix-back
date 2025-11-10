import { BaseQueryHandler } from "@safliix-back/cqrs";
import { Result, Err, Ok } from "oxide.ts";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { QueryHandler } from "@nestjs/cqrs";
import type { IPurchaseRepository } from "../../domain/ports/purchase.repository";
import { PURCHASE_REPOSITORY } from "../../utils/types";
import { Purchase } from "../../domain/entities/purchase.entity";
import { ListPurchasesByUserQuery } from "../cqrs/queries/list-purchases-by-user.query";

@Injectable()
@QueryHandler(ListPurchasesByUserQuery)
export class ListPurchasesByUserHandler extends BaseQueryHandler<
  ListPurchasesByUserQuery,
  Result<Purchase[], Error>
> {
  protected override logger = new Logger(ListPurchasesByUserHandler.name);

  constructor(
    @Inject(PURCHASE_REPOSITORY)
    private readonly repository: IPurchaseRepository
  ) {
    super();
  }

  protected override async handle(query: ListPurchasesByUserQuery): Promise<Result<Purchase[], Error>> {
    const safeResult = await Result.safe(this.repository.findAllByUser(query.userId));
    return safeResult.isErr() ? Err(safeResult.unwrapErr()) : Ok(safeResult.unwrap());
  }
}
