import { IQuery } from "@nestjs/cqrs";


export class CountSeasonQuery implements IQuery{
  constructor(
    public readonly serieId:string
  ){}
}