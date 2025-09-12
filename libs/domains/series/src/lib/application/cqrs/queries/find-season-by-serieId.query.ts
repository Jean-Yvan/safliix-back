import { IQuery } from "@nestjs/cqrs";


export class FindSeasonsBySerieId implements IQuery{
  constructor(
    public readonly id:string
  ){}
}