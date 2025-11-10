import { CreateSubscriptionPlanDto } from "src/lib/interfaces/dto/create-subscription-plan.dto";
import { ICommand } from "@nestjs/cqrs";

export class CreateSubscriptionPlanCommand implements ICommand{
  constructor(
    public readonly payload:CreateSubscriptionPlanDto
  ){}
}