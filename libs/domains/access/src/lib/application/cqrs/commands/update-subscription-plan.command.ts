import { UpdateSubscriptionPlanDto } from "../../../interfaces/dto/update-subscription-plan.dto";

export class UpdateSubscriptionPlanCommand{
 constructor(
  public readonly payload : UpdateSubscriptionPlanDto
 ){} 
}