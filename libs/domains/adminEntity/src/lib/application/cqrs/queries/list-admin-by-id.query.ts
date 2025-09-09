import { IQuery } from "@nestjs/cqrs";

export class ListAdminByIdQuery implements IQuery{
  constructor(
    public readonly id:string
  ){}
}