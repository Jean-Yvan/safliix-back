import { IQuery } from "@nestjs/cqrs";

export class ListSubscriptionPlanByIdQuery implements IQuery{
  constructor(public readonly id: string) {}
}