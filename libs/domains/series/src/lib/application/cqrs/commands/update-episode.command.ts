import { ICommand } from "@nestjs/cqrs";
import { UpdateEpisodeDto } from "../../../interfaces/update-episode.dto";

export class UpdateEpisodeCommand implements ICommand{
  constructor(
    public readonly payload:UpdateEpisodeDto
  ){}
}