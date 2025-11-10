import { BaseHandler } from "@safliix-back/cqrs";
import { Result, Err, Ok } from "oxide.ts";
import { Inject, Injectable } from "@nestjs/common";
import { CommandHandler } from "@nestjs/cqrs";
import type { IPurchaseRepository } from "../../domain/ports/purchase.repository";
import { PURCHASE_REPOSITORY } from "../../utils/types";
import { Purchase } from "../../domain/entities/purchase.entity";
import { CreatePurchaseCommand } from "../cqrs/commands/create-purchase.command";

@Injectable()
@CommandHandler(CreatePurchaseCommand)
export class CreatePurchaseHandler extends BaseHandler<CreatePurchaseCommand, Result<Purchase, Error>> {
  constructor(
    @Inject(PURCHASE_REPOSITORY)
    private readonly repository: IPurchaseRepository
  ) {
    super();
  }

  protected override async handle(command: CreatePurchaseCommand): Promise<Result<Purchase, Error>> {
    const purchaseResult = Purchase.create({
      userId: command.payload.userId,
      videoId: command.payload.videoId,
      country: command.payload.country ?? null,
    });

    if (purchaseResult.isErr()) {
      return Err(purchaseResult.unwrapErr());
    }

    const existingPurchase = await this.repository.findByUserAndVideo(
      command.payload.userId,
      command.payload.videoId
    );

    if (
      existingPurchase &&
      (!existingPurchase.expirationDate || existingPurchase.expirationDate > new Date())
    ) {
      return Err(
        new Error(
          "L'utilisateur possède déjà une location active pour cette vidéo"
        )
      );
    }

    const safeResult = await Result.safe(this.repository.create(purchaseResult.unwrap()));
    return safeResult.isErr() ? Err(safeResult.unwrapErr()) : Ok(safeResult.unwrap());
  }
}
