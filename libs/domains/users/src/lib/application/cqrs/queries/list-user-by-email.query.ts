import { IQuery } from "@nestjs/cqrs";

export class ListUserByEmailQuery implements IQuery{
  constructor(public readonly email: string) {}
}
