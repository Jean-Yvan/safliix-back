import { UpdateSubscriptionDto } from "../../../interfaces/dto/update-subscription.dto";

import { ICommand } from "@nestjs/cqrs";

export class UpdateSubscriptionCommand implements ICommand{
  constructor(
    public readonly payload: UpdateSubscriptionDto
  ) {}
}
