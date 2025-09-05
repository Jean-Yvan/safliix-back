import { CreateSubscriptionDto } from "../../../interfaces/dto/create-subscription.dto";

export class CreateSubscriptionCommand{
  constructor(
    public readonly payload:CreateSubscriptionDto
  ){}
}