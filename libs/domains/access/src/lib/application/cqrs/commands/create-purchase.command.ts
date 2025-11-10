import { CreatePurchaseDto } from "../../../interfaces/dto/create-purchase.dto";
import { ICommand } from "@nestjs/cqrs";

export class CreatePurchaseCommand implements ICommand{
  constructor(public readonly payload: CreatePurchaseDto) {}
}
