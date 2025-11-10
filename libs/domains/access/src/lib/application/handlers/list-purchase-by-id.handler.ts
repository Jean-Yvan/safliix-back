import { BaseQueryHandler } from "@safliix-back/cqrs";
import { Result, Err, Ok } from "oxide.ts";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { QueryHandler } from "@nestjs/cqrs";
import type { IPurchaseRepository } from "../../domain/ports/purchase.repository";
import { PURCHASE_REPOSITORY } from "../../utils/types";
import { Purchase } from "../../domain/entities/purchase.entity";
import { ListPurchaseByIdQuery } from "../cqrs/queries/list-purchase-by-id.query";

@Injectable()
@QueryHandler(ListPurchaseByIdQuery)
export class ListPurchaseByIdHandler extends BaseQueryHandler<ListPurchaseByIdQuery, Result<Purchase, Error>> {
  protected override logger = new Logger(ListPurchaseByIdHandler.name);

  constructor(
    @Inject(PURCHASE_REPOSITORY)
    private readonly repository: IPurchaseRepository
  ) {
    super();
  }

  protected override async handle(query: ListPurchaseByIdQuery): Promise<Result<Purchase, Error>> {
    const safeResult = await Result.safe(this.repository.findById(query.id));
    if (safeResult.isErr()) {
      return Err(safeResult.unwrapErr());
    }

    const purchase = safeResult.unwrap();
    if (!purchase) {
      return Err(new Error("Purchase not found"));
    }

    return Ok(purchase);
  }
}
