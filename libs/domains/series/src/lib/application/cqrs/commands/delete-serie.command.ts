import { ICommand } from "@nestjs/cqrs";

export class DeleteSerieCommand implements ICommand{
  constructor(
    public readonly id:string
  ){}
}