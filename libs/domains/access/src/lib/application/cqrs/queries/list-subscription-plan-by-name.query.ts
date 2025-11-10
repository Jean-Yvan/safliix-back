import { IQuery } from "@nestjs/cqrs";

export class ListSubscriptionPlanByNameQuery implements IQuery {
  constructor(public readonly name: string) {}
}