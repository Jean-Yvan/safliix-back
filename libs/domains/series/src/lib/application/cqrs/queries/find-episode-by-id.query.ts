import { IQuery } from "@nestjs/cqrs";

export class FindEpisodeByIdQuery implements IQuery{
  constructor(
    public readonly id:string
  ){}
}