import { Episode } from './episode.entity';

export class Season {
  private _episodes: Episode[] = [];

  constructor(
    public readonly id: string,
    public readonly number: number,
    public readonly serieId: string,
    public title?: string
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
}
