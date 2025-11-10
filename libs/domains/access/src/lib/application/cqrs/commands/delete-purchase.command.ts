import { ICommand } from "@nestjs/cqrs";

export class DeletePurchaseCommand implements ICommand{
  constructor(public readonly id: string) {}
}
