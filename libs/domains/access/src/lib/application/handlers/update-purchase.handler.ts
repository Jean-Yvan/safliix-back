import { BaseHandler } from "@safliix-back/cqrs";
import { Result, Err, Ok } from "oxide.ts";
import { Inject, Injectable } from "@nestjs/common";
import { CommandHandler } from "@nestjs/cqrs";
import type { IPurchaseRepository } from "../../domain/ports/purchase.repository";
import { PURCHASE_REPOSITORY } from "../../utils/types";
import { Purchase, PurchaseUpdateProps } from "../../domain/entities/purchase.entity";
import { UpdatePurchaseCommand } from "../cqrs/commands/update-purchase.command";
import { UpdatePurchaseDto } from "../../interfaces/dto/update-purchase.dto";

@Injectable()
@CommandHandler(UpdatePurchaseCommand)
export class UpdatePurchaseHandler extends BaseHandler<UpdatePurchaseCommand, Result<Purchase, Error>> {
  constructor(
    @Inject(PURCHASE_REPOSITORY)
    private readonly repository: IPurchaseRepository
  ) {
    super();
  }

  protected override async handle(command: UpdatePurchaseCommand): Promise<Result<Purchase, Error>> {
    const existing = await this.repository.findById(command.payload.id);
    if (!existing) {
      return Err(new Error("Purchase not found"));
    }

    const updated = existing.updateWith(mapUpdateDtoToProps(command.payload));
    if (updated.isErr()) {
      return Err(updated.unwrapErr());
    }

    const safeResult = await Result.safe(this.repository.update(command.payload.id, updated.unwrap()));
    return safeResult.isErr() ? Err(safeResult.unwrapErr()) : Ok(safeResult.unwrap());
  }
}

const mapUpdateDtoToProps = (dto: UpdatePurchaseDto): PurchaseUpdateProps => ({
  userId: dto.userId,
  videoId: dto.videoId,
  country: dto.country,
  expirationDate:
    dto.expirationDate === undefined
      ? undefined
      : dto.expirationDate
        ? new Date(dto.expirationDate)
        : null,
});
