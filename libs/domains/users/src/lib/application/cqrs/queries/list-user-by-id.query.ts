import { IQuery } from "@nestjs/cqrs";

export class ListUserByIdQuery implements IQuery{
  constructor(public readonly userId: string) {}
}