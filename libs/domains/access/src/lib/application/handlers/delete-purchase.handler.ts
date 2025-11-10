import { BaseHandler } from "@safliix-back/cqrs";
import { Result, Err, Ok } from "oxide.ts";
import { Inject, Injectable } from "@nestjs/common";
import { CommandHandler } from "@nestjs/cqrs";
import type { IPurchaseRepository } from "../../domain/ports/purchase.repository";
import { PURCHASE_REPOSITORY } from "../../utils/types";
import { DeletePurchaseCommand } from "../cqrs/commands/delete-purchase.command";

@Injectable()
@CommandHandler(DeletePurchaseCommand)
export class DeletePurchaseHandler extends BaseHandler<DeletePurchaseCommand, Result<void, Error>> {
  constructor(
    @Inject(PURCHASE_REPOSITORY)
    private readonly repository: IPurchaseRepository
  ) {
    super();
  }

  protected override async handle(command: DeletePurchaseCommand): Promise<Result<void, Error>> {
    const safeResult = await Result.safe(this.repository.delete(command.id));
    return safeResult.isErr() ? Err(safeResult.unwrapErr()) : Ok(undefined);
  }
}
