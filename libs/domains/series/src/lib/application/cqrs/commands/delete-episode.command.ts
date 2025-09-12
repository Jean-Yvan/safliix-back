import { ICommand } from "@nestjs/cqrs";

export class DeleteEpisodeCommand implements ICommand{
  constructor(
    public readonly id:string
  ){}
}