import { UpdateSubscriptionPlanDto } from "../../../interfaces/dto/update-subscription-plan.dto";

import { ICommand } from "@nestjs/cqrs";

export class UpdateSubscriptionPlanCommand implements ICommand{
 constructor(
  public readonly payload : UpdateSubscriptionPlanDto
 ){} 
}