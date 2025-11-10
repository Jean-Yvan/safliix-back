import { IQuery } from "@nestjs/cqrs";

export class ListSubscriptionByIdQuery implements IQuery{
  constructor(public readonly id: string) {}
}
