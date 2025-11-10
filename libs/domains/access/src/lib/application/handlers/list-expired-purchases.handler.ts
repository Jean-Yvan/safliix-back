import { BaseQueryHandler } from "@safliix-back/cqrs";
import { Result, Err, Ok } from "oxide.ts";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { QueryHandler } from "@nestjs/cqrs";
import type { IPurchaseRepository } from "../../domain/ports/purchase.repository";
import { PURCHASE_REPOSITORY } from "../../utils/types";
import { Purchase } from "../../domain/entities/purchase.entity";
import { ListExpiredPurchasesQuery } from "../cqrs/queries/list-expired-purchases.query";

@Injectable()
@QueryHandler(ListExpiredPurchasesQuery)
export class ListExpiredPurchasesHandler extends BaseQueryHandler<
  ListExpiredPurchasesQuery,
  Result<Purchase[], Error>
> {
  protected override logger = new Logger(ListExpiredPurchasesHandler.name);

  constructor(
    @Inject(PURCHASE_REPOSITORY)
    private readonly repository: IPurchaseRepository
  ) {
    super();
  }

  protected override async handle(_: ListExpiredPurchasesQuery): Promise<Result<Purchase[], Error>> {
    const safeResult = await Result.safe(this.repository.findExpired());
    return safeResult.isErr() ? Err(safeResult.unwrapErr()) : Ok(safeResult.unwrap());
  }
}
