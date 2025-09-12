import { SeasonWithRelations } from '@safliix-back/database';
import { AddSeasonDto } from '../../interfaces/add-season.dto';
import { Episode } from './episode.entity';
import { Result,Ok,Err } from 'oxide.ts';
import { UpdateSeasonDto } from '../../interfaces/update-season.dto';


export class Season {
  private _episodes: Episode[] = [];

  constructor(
    public id: string | undefined,
    public number: number,
    public serieId: string,
    public title: string | null
  ) {}

  addEpisode(episode: Episode) {
    if (this._episodes.some(e => e.number === episode.number)) {
      throw new Error(`Episode ${episode.number} already exists`);
    }
    this._episodes.push(episode);
  }

  get episodes() {
    return [...this._episodes]; // copie pour éviter les modifications externes
  }

  static create(data:AddSeasonDto): Result<Season,Error> {
    return Ok(new Season(
      undefined,
      data.numero,
      data.seriesId,
      data.title ?? null
    ))
  }

  static restore(data:SeasonWithRelations) : Season{
    return new Season(
      data.id,
      data.number,
      data.seriesId,
      ''
    )
  }

  updateWith(data:UpdateSeasonDto){
    this.id = data.id;
    this.number = data.numero ? data.numero : this.number;
    this.serieId = data.seriesId ? data.seriesId : this.serieId;
  }
}
