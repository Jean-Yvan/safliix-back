import { UpdatePurchaseDto } from "../../../interfaces/dto/update-purchase.dto";

import { ICommand } from "@nestjs/cqrs";

export class UpdatePurchaseCommand implements ICommand{
  constructor(public readonly payload: UpdatePurchaseDto) {}
}
