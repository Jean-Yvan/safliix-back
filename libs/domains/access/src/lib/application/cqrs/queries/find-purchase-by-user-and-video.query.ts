import { IQuery } from "@nestjs/cqrs";

export class FindPurchaseByUserAndVideoQuery implements IQuery{
  constructor(
    public readonly userId: string,
    public readonly videoId: string
  ) {}
}
