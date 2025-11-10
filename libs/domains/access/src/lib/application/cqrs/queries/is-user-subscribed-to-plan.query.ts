import { IQuery } from "@nestjs/cqrs";

export class IsUserSubscribedToPlanQuery implements IQuery{
  constructor(
    public readonly userId: string,
    public readonly planId: string
  ) {}
}
