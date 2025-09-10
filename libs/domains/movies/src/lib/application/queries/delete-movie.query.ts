import { IQuery } from "@nestjs/cqrs";

export class DeleteMovieQuery implements IQuery{
  constructor(
    public readonly id:string
  ){}
}