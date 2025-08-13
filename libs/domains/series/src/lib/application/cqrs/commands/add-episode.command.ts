import { AddEpisodeDto } from '../../../interfaces/add-episode.dto';

export class AddEpisodeCommand {
  constructor(
    public readonly payload :  AddEpisodeDto
  ){}
}