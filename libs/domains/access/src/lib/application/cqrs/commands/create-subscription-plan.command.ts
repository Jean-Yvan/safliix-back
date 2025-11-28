import { CreateSubscriptionPlanDto } from "../../../interfaces/dto/create-subscription-plan.dto";
import { ICommand } from "@nestjs/cqrs";

export class CreateSubscriptionPlanCommand implements ICommand{
  constructor(
    public readonly payload:CreateSubscriptionPlanDto
  ){}
}
