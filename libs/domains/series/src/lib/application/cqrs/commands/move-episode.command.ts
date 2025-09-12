import { ICommand } from "@nestjs/cqrs";

export class MoveEpisodeCommand implements ICommand{
  constructor(
    public readonly episodeId:string,
    public readonly seasonId: string
  ){}
}