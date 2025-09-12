import { IQuery } from "@nestjs/cqrs";

export class FindSeasonByIdQuery implements IQuery{
  constructor(
    public readonly id:string
  ){}
}