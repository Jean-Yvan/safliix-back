import { ICommand } from "@nestjs/cqrs";

export class DeleteSeasonCommand implements ICommand{
  constructor(
    public readonly id:string
  ){}
}