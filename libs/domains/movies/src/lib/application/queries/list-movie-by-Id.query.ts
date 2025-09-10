import { IQuery } from "@nestjs/cqrs";


export class ListMovieByIdQuery implements IQuery{
  constructor(
    public readonly id:string
  ){}
}