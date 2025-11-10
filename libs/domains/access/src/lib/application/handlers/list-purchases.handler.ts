import { BaseQueryHandler } from "@safliix-back/cqrs";
import { Result, Err, Ok } from "oxide.ts";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { QueryHandler } from "@nestjs/cqrs";
import type { IPurchaseRepository } from "../../domain/ports/purchase.repository";
import { PURCHASE_REPOSITORY } from "../../utils/types";
import { Purchase } from "../../domain/entities/purchase.entity";
import { ListPurchasesQuery } from "../cqrs/queries/list-purchases.query";

@Injectable()
@QueryHandler(ListPurchasesQuery)
export class ListPurchasesHandler extends BaseQueryHandler<ListPurchasesQuery, Result<Purchase[], Error>> {
  protected override logger = new Logger(ListPurchasesHandler.name);

  constructor(
    @Inject(PURCHASE_REPOSITORY)
    private readonly repository: IPurchaseRepository
  ) {
    super();
  }

  protected override async handle(_: ListPurchasesQuery): Promise<Result<Purchase[], Error>> {
    const safeResult = await Result.safe(this.repository.findAll());
    return safeResult.isErr() ? Err(safeResult.unwrapErr()) : Ok(safeResult.unwrap());
  }
}
