import { IQuery } from "@nestjs/cqrs";

export class ListActiveSubscriptionByUserQuery implements IQuery{
  constructor(public readonly userId: string) {}
}
