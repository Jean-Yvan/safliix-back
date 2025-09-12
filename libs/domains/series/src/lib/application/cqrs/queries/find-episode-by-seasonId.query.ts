import { IQuery } from "@nestjs/cqrs";


export class FindEpisodesBySeasonId implements IQuery{
  constructor(
    public readonly id:string
  ){}
}