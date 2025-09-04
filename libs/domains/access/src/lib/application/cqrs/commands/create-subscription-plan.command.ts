import { CreateSubscriptionPlanDto } from "src/lib/interfaces/dto/create-subscription-plan.dto";

export class CreateSubscriptionPlanCommand{
  constructor(
    public readonly payload:CreateSubscriptionPlanDto
  ){}
}