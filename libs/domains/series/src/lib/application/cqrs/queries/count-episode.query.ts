import { IQuery } from "@nestjs/cqrs";


export class CountEpisodeQuery implements IQuery{
  constructor(
    public readonly seasonId:string
  ){}
}