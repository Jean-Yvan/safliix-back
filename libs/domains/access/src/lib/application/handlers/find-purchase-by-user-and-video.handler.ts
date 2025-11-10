import { BaseQueryHandler } from "@safliix-back/cqrs";
import { Result, Err, Ok } from "oxide.ts";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { QueryHandler } from "@nestjs/cqrs";
import type { IPurchaseRepository } from "../../domain/ports/purchase.repository";
import { PURCHASE_REPOSITORY } from "../../utils/types";
import { Purchase } from "../../domain/entities/purchase.entity";
import { FindPurchaseByUserAndVideoQuery } from "../cqrs/queries/find-purchase-by-user-and-video.query";

@Injectable()
@QueryHandler(FindPurchaseByUserAndVideoQuery)
export class FindPurchaseByUserAndVideoHandler extends BaseQueryHandler<
  FindPurchaseByUserAndVideoQuery,
  Result<Purchase, Error>
> {
  protected override logger = new Logger(FindPurchaseByUserAndVideoHandler.name);

  constructor(
    @Inject(PURCHASE_REPOSITORY)
    private readonly repository: IPurchaseRepository
  ) {
    super();
  }

  protected override async handle(
    query: FindPurchaseByUserAndVideoQuery
  ): Promise<Result<Purchase, Error>> {
    const safeResult = await Result.safe(this.repository.findByUserAndVideo(query.userId, query.videoId));
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
