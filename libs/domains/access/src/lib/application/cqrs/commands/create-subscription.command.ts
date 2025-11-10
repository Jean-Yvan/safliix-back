import { CreateSubscriptionDto } from "../../../interfaces/dto/create-subscription.dto";

import { ICommand } from "@nestjs/cqrs";

export class CreateSubscriptionCommand implements ICommand{
  constructor(
    public readonly payload:CreateSubscriptionDto
  ){}
}