import { IQuery } from "@nestjs/cqrs";

export class ListAdminByEmailQuery implements IQuery{
  constructor(
    public readonly email:string
  ){}
}