import { IQuery } from "@nestjs/cqrs";


export class FindSerieByIdQuery implements IQuery{
  constructor(
    public readonly id:string
  ){}
}