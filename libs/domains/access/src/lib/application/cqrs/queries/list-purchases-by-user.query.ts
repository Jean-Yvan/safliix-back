import { IQuery } from "@nestjs/cqrs";

export class ListPurchasesByUserQuery implements IQuery{
  constructor(public readonly userId: string) {}
}
