import { ICommand } from "@nestjs/cqrs";

export class DeleteSubscriptionCommand implements ICommand{
  constructor(public readonly id: string) {}
}
