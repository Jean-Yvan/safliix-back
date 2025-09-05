import { UpdateSubscriptionDto } from "../../../interfaces/dto/update-subscription.dto";

export class UpdateSubscriptionCommand {
  constructor(
    public readonly payload: UpdateSubscriptionDto
  ) {}
}
