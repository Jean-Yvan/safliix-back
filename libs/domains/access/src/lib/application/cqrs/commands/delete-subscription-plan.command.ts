import { ICommand } from "@nestjs/cqrs";

export class DeleteSubscriptionPlanCommand implements ICommand{
  constructor(public readonly id: string) {}
}
