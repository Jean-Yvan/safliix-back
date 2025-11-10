import { IQuery } from "@nestjs/cqrs";

export class ListPurchaseByIdQuery implements IQuery{
  constructor(public readonly id: string) {}
}
